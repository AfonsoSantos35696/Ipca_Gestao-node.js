const express = require('express');
const router = express.Router();
const { hasRole } = require('../middleware/auth');
const EnrollmentRequest = require('../models/EnrollmentRequest');
const GradeSheet = require('../models/GradeSheet');
const Discipline = require('../models/Discipline');
const User = require('../models/User');

router.use(hasRole('funcionario'));

router.get('/dashboard', async (req, res) => {
    const pendentes = await EnrollmentRequest.countDocuments({ estado: 'pendente' });
    const totalPautas = await GradeSheet.countDocuments();
    res.render('funcionario/dashboard', { pendentes, totalPautas });
});

// Enrollment requests
router.get('/pedidos_matricula', async (req, res) => {
    const pendentes = await EnrollmentRequest.find({ estado: 'pendente' })
        .populate('id_aluno', 'nome')
        .populate('id_curso', 'nome_cursos');
    const outros = await EnrollmentRequest.find({ estado: { $ne: 'pendente' } })
        .populate('id_aluno', 'nome')
        .populate('id_curso', 'nome_cursos')
        .sort('-data_decisao');
    res.render('funcionario/enrollmentRequests', { pendentes, outros, message: req.query.msg });
});
router.post('/pedidos_matricula/decide', async (req, res) => {
    const { id_pedido, acao, observacoes } = req.body;
    await EnrollmentRequest.findByIdAndUpdate(id_pedido, {
        estado: acao,
        observacoes,
        data_decisao: new Date(),
        id_funcionario: req.session.userId
    });
    res.redirect('/funcionario/pedidos_matricula?msg=Pedido atualizado');
});

// Grade sheets
router.get('/pautas', async (req, res) => {
    const pautas = await GradeSheet.find().populate('id_disciplina', 'nome_disciplina').sort('-data_criacao');
    const disciplinas = await Discipline.find();
    res.render('funcionario/gradeSheets', { pautas, disciplinas, message: req.query.msg });
});
router.post('/pautas/create', async (req, res) => {
    const { id_disciplina, ano_letivo, epoca } = req.body;
    const allStudents = await User.find({ role: 'aluno' });
    const notas = allStudents.map(s => ({ aluno: s._id, nota: null }));
    const newPauta = new GradeSheet({
        id_disciplina,
        ano_letivo,
        epoca,
        id_funcionario_criador: req.session.userId,
        notas
    });
    await newPauta.save();
    res.redirect('/funcionario/pautas?msg=Pauta criada');
});
router.get('/pautas/lancar/:id', async (req, res) => {
    const pauta = await GradeSheet.findById(req.params.id).populate('id_disciplina').populate('notas.aluno');
    res.render('funcionario/gradeSheetForm', { pauta });
});
router.post('/pautas/update/:id', async (req, res) => {
    const pauta = await GradeSheet.findById(req.params.id);
    for (let i = 0; i < pauta.notas.length; i++) {
        if (req.body.nota[pauta.notas[i]._id] !== undefined) {
            pauta.notas[i].nota = parseFloat(req.body.nota[pauta.notas[i]._id]);
        }
    }
    await pauta.save();
    res.redirect('/funcionario/pautas?msg=Notas guardadas');
});
router.get('/pautas/ver/:id', async (req, res) => {
    const pauta = await GradeSheet.findById(req.params.id).populate('id_disciplina').populate('notas.aluno');
    res.render('funcionario/viewGradeSheet', { pauta });
});

module.exports = router;