const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { hasRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const StudentForm = require('../models/StudentForm');
const EnrollmentRequest = require('../models/EnrollmentRequest');
const Course = require('../models/Course');
const User = require('../models/User');

router.use(hasRole('aluno'));

router.get('/dashboard', async (req, res) => {
    const ficha = await StudentForm.findOne({ id_aluno: req.session.userId }).sort('-data_submissao');
    const matricula = await EnrollmentRequest.findOne({ id_aluno: req.session.userId }).sort('-data_pedido');
    res.render('aluno/dashboard', { ficha, matricula });
});

router.get('/ficha', async (req, res) => {
    const ficha = await StudentForm.findOne({ id_aluno: req.session.userId }).sort('-data_submissao').populate('id_curso', 'nome_cursos');
    const pedidoMatricula = await EnrollmentRequest.findOne({ id_aluno: req.session.userId, estado: { $in: ['pendente', 'aprovado'] } })
        .sort('-data_pedido')
        .populate('id_curso', 'nome_cursos');

    const cursoPretendido = pedidoMatricula?.id_curso || null;

    res.render('aluno/studentForm', { ficha, cursoPretendido, message: req.query.msg, error: req.query.error });
});
router.post('/ficha', upload.single('fotografia'), async (req, res) => {
    const { nome_completo, data_nascimento, morada, telefone, email_contato } = req.body;
    const pedidoMatricula = await EnrollmentRequest.findOne({ id_aluno: req.session.userId, estado: { $in: ['pendente', 'aprovado'] } })
        .sort('-data_pedido');
    const id_curso = pedidoMatricula?.id_curso;

    if (!id_curso) {
        return res.redirect('/aluno/ficha?error=É necessário ter um pedido de matrícula com curso associado antes de preencher a ficha');
    }

    const existing = await StudentForm.findOne({ id_aluno: req.session.userId, estado: 'rascunho' });
    let fotoPath = existing ? existing.fotografia : null;
    if (req.file) fotoPath = '/uploads/' + req.file.filename;
    if (existing) {
        await StudentForm.findByIdAndUpdate(existing._id, {
            nome_completo, data_nascimento, morada, telefone, email_contato, id_curso,
            fotografia: fotoPath
        });
    } else {
        const newForm = new StudentForm({
            id_aluno: req.session.userId,
            id_curso, nome_completo, data_nascimento, morada, telefone, email_contato,
            fotografia: fotoPath,
            estado: 'rascunho'
        });
        await newForm.save();
    }
    res.redirect('/aluno/ficha?msg=Rascunho guardado');
});
router.get('/ficha/submeter', async (req, res) => {
    const ficha = await StudentForm.findOne({ id_aluno: req.session.userId, estado: 'rascunho' });
    if (ficha) {
        ficha.estado = 'submetida';
        ficha.data_submissao = new Date();
        await ficha.save();
        res.redirect('/aluno/ficha?msg=Ficha submetida para validação');
    } else {
        res.redirect('/aluno/ficha?error=Nenhum rascunho encontrado');
    }
});

router.get('/matricula', async (req, res) => {
    const pedido = await EnrollmentRequest.findOne({ id_aluno: req.session.userId }).sort('-data_pedido');
    const cursosRaw = await Course.find().lean();
    const disciplinaIds = [...new Set(cursosRaw
        .flatMap(curso => (curso.disciplinas || [])
            .map(id => id?.toString?.() || String(id))
            .filter(id => mongoose.Types.ObjectId.isValid(id))
            .map(id => new mongoose.Types.ObjectId(id))
        ))];
    const disciplinas = disciplinaIds.length > 0
        ? await require('../models/Discipline').find({ _id: { $in: disciplinaIds } }).select('nome_disciplina').lean()
        : [];
    const disciplinaNomeById = Object.fromEntries(
        disciplinas.map(disciplina => [disciplina._id.toString(), disciplina.nome_disciplina])
    );
    const cursos = cursosRaw.map(curso => ({
        ...curso,
        disciplinasNomes: (curso.disciplinas || []).map(id => disciplinaNomeById[id.toString()] || 'UC sem nome')
    }));
    res.render('aluno/enrollment', { pedido, cursos, message: req.query.msg, error: req.query.error });
});
router.post('/matricula', async (req, res) => {
    const existing = await EnrollmentRequest.findOne({ id_aluno: req.session.userId, estado: { $in: ['pendente', 'aprovado'] } });
    if (existing) return res.redirect('/aluno/matricula?error=Já existe um pedido pendente ou aprovado');
    const newRequest = new EnrollmentRequest({ id_aluno: req.session.userId, id_curso: req.body.id_curso });
    await newRequest.save();
    res.redirect('/aluno/matricula?msg=Pedido efetuado com sucesso');
});


router.get('/consultar', async (req, res) => {
    const fichas = await StudentForm.find({ id_aluno: req.session.userId }).sort('-data_submissao');
    const pedidos = await EnrollmentRequest.find({ id_aluno: req.session.userId })
        .populate('id_curso', 'nome_cursos')
        .populate('id_funcionario', 'nome')
        .sort('-data_pedido');
    res.render('aluno/consultStatus', { fichas, pedidos });
});

module.exports = router;