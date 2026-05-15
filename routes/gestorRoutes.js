const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { hasRole } = require('../middleware/auth');
const Course = require('../models/Course');
const Discipline = require('../models/Discipline');
const StudyPlan = require('../models/StudyPlan');
const StudentForm = require('../models/StudentForm');
const User = require('../models/User');

router.use(hasRole('gestor'));

// Dashboard
router.get('/dashboard', async (req, res) => {
    const totalCursos = await Course.countDocuments();
    const totalDisciplinas = await Discipline.countDocuments();
    const fichasSubmetidas = await StudentForm.countDocuments({ estado: 'submetida' });
    res.render('gestor/dashboard', { totalCursos, totalDisciplinas, fichasSubmetidas });
});

// Courses CRUD
router.get('/cursos', async (req, res) => {
    const cursos = await Course.find().sort('nome_cursos').populate('disciplinas');
    const disciplinas = await Discipline.find().sort('nome_disciplina');
    res.render('gestor/courses', { cursos, disciplinas, message: req.query.msg });
});
const parseDisciplineInput = input => {
    if (!input) return [];
    if (Array.isArray(input)) return input.map(item => item.trim()).filter(Boolean);
    return input.split(/[\r\n,]+/).map(item => item.trim()).filter(Boolean);
};

const resolveDisciplineIds = async items => {
    const ids = [];
    for (const item of items) {
        const nome = item.trim();
        if (!nome) continue;
        if (mongoose.Types.ObjectId.isValid(nome)) {
            const existente = await Discipline.findById(nome).select('_id').lean();
            if (existente) {
                ids.push(nome);
                continue;
            }
        }
        const disciplina = await Discipline.findOneAndUpdate(
            { nome_disciplina: nome },
            { nome_disciplina: nome },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        ids.push(disciplina._id.toString());
    }
    return ids;
};

router.post('/cursos/add', async (req, res) => {
    try {
        console.log('=== ADD COURSE REQUEST ===');
        console.log('Full Body:', JSON.stringify(req.body, null, 2));
        
        const nomeCurso = req.body.nome_cursos?.trim();
        let disciplinas = req.body['disciplinas[]'] || req.body.disciplinas || [];
        
        // Converter para array se for string única
        if (typeof disciplinas === 'string') {
            disciplinas = [disciplinas];
        }
        
        // Filtrar strings vazias
        const disciplinasList = Array.isArray(disciplinas)
            ? disciplinas.map(d => (typeof d === 'string' ? d.trim() : d)).filter(d => d && d.length > 0)
            : [];
        
        console.log('Nome do Curso:', nomeCurso);
        console.log('Disciplinas recebidas:', disciplinasList);
        
        if (!nomeCurso) {
            return res.redirect('/gestor/cursos?msg=Erro: nome do curso obrigatório');
        }
        
        if (disciplinasList.length === 0) {
            return res.redirect('/gestor/cursos?msg=Erro: adicione pelo menos uma UC');
        }
        
        // Criar disciplinas
        const disciplinaIds = [];
        for (const nome of disciplinasList) {
            const disciplina = await Discipline.findOneAndUpdate(
                { nome_disciplina: nome },
                { nome_disciplina: nome },
                { upsert: true, new: true }
            );
            disciplinaIds.push(disciplina._id.toString());
            console.log(`✅ UC: ${nome} (ID: ${disciplina._id})`);
        }
        
        console.log('Todos os IDs:', disciplinaIds);
        
        // Criar curso
        const newCourse = await Course.create({
            nome_cursos: nomeCurso,
            disciplinas: disciplinaIds
        });
        
        console.log('✅ Curso criado:', newCourse);
        
        // Verificar
        const verificacao = await Course.findById(newCourse._id).populate('disciplinas');
        console.log('Verificação:', {
            nome: verificacao.nome_cursos,
            uc_count: verificacao.disciplinas.length,
            uc_names: verificacao.disciplinas.map(d => d.nome_disciplina)
        });
        console.log('=== END ADD COURSE ===\n');
        
        res.redirect('/gestor/cursos?msg=Curso adicionado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao adicionar curso:', error);
        res.redirect('/gestor/cursos?msg=Erro ao adicionar curso');
    }
});
router.post('/cursos/edit', async (req, res) => {
    try {
        console.log('=== EDIT COURSE REQUEST ===');
        console.log('Body:', req.body);
        
        const id = req.body.id_cursos;
        const nome = req.body.nome_cursos?.trim();
        let disciplinas = req.body['disciplinas[]'] || req.body.disciplinas || [];
        
        // Converter para array se for string única
        if (typeof disciplinas === 'string') {
            disciplinas = [disciplinas];
        }
        
        // Filtrar strings vazias
        const disciplinasList = Array.isArray(disciplinas)
            ? disciplinas.map(d => (typeof d === 'string' ? d.trim() : d)).filter(d => d && d.length > 0)
            : [];
        
        console.log('ID do curso:', id);
        console.log('Nome:', nome);
        console.log('Disciplinas:', disciplinasList);
        
        if (!nome) {
            return res.redirect('/gestor/cursos?msg=Erro: nome do curso obrigatório');
        }
        
        if (disciplinasList.length === 0) {
            return res.redirect('/gestor/cursos?msg=Erro: adicione pelo menos uma UC');
        }
        
        // Criar disciplinas
        const disciplinaIds = [];
        for (const nome of disciplinasList) {
            const disciplina = await Discipline.findOneAndUpdate(
                { nome_disciplina: nome },
                { nome_disciplina: nome },
                { upsert: true, new: true }
            );
            disciplinaIds.push(disciplina._id.toString());
        }
        
        console.log('IDs das disciplinas:', disciplinaIds);
        
        // Atualizar curso
        const updated = await Course.findByIdAndUpdate(
            id,
            { nome_cursos: nome, disciplinas: disciplinaIds },
            { new: true }
        ).populate('disciplinas');
        
        console.log('✅ Curso atualizado:', updated);
        console.log('=== END EDIT COURSE ===\n');
        
        res.redirect('/gestor/cursos?msg=Curso atualizado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao editar curso:', error);
        res.redirect('/gestor/cursos?msg=Erro ao editar curso');
    }
});
router.get('/cursos/delete/:id', async (req, res) => {
    await Course.findByIdAndDelete(req.params.id);
    res.redirect('/gestor/cursos?msg=Curso eliminado');
});

// Disciplines CRUD (similar to courses)
router.get('/disciplinas', async (req, res) => {
    const disciplinas = await Discipline.find().sort('nome_disciplina').populate('courseId');
    const cursos = await Course.find().sort('nome_cursos');
    const courseNamesByDisciplineId = {};

    cursos.forEach(course => {
        (course.disciplinas || []).forEach(discipline => {
            const disciplineId = discipline?._id?.toString?.();
            if (disciplineId) {
                courseNamesByDisciplineId[disciplineId] = course.nome_cursos;
            }
        });
    });

    res.render('gestor/disciplines', { disciplinas, cursos, courseNamesByDisciplineId, message: req.query.msg });
});
router.post('/disciplinas/add', async (req, res) => {
    try {
        const { nome_disciplina, courseId } = req.body;
        
        // Verificar se o curso existe
        const course = await Course.findById(courseId);
        if (!course) {
            return res.redirect('/gestor/disciplinas?msg=Erro: Curso não encontrado');
        }

        // Criar a UC com o courseId
        await Discipline.create({ 
            nome_disciplina, 
            courseId 
        });
        
        res.redirect('/gestor/disciplinas?msg=Disciplina adicionada');
    } catch (error) {
        console.error('Erro ao adicionar disciplina:', error);
        res.redirect('/gestor/disciplinas?msg=Erro ao adicionar disciplina');
    }
});
router.post('/disciplinas/edit', async (req, res) => {
    try {
        const { id_disciplina, nome_disciplina, courseId } = req.body;
        
        // Verificar se o curso existe
        const course = await Course.findById(courseId);
        if (!course) {
            return res.redirect('/gestor/disciplinas?msg=Erro: Curso não encontrado');
        }

        await Discipline.findByIdAndUpdate(id_disciplina, { 
            nome_disciplina,
            courseId
        });
        
        res.redirect('/gestor/disciplinas?msg=Disciplina atualizada');
    } catch (error) {
        console.error('Erro ao editar disciplina:', error);
        res.redirect('/gestor/disciplinas?msg=Erro ao editar disciplina');
    }
});

router.get('/disciplinas/delete/:id', async (req, res) => {
    const id = req.params.id;
    await Course.updateMany({}, { $pull: { disciplinas: id } });
    await Discipline.findByIdAndDelete(id);
    res.redirect('/gestor/disciplinas?msg=Disciplina eliminada');
});

// Study Plan
router.get('/plano_estudos', async (req, res) => {
    const planos = await StudyPlan.find().populate('course').populate('discipline');
    const cursos = await Course.find().populate('disciplinas');
    const disciplinas = await Discipline.find();
    res.render('gestor/studyPlan', { planos, cursos, disciplinas, message: req.query.msg, error: null });
});
router.post('/plano_estudos/add', async (req, res) => {
    const { curso, disciplina, ano, semestre } = req.body;
    const exists = await StudyPlan.findOne({ course: curso, discipline: disciplina, ano, semestre });
    if (exists) return res.redirect('/gestor/plano_estudos?msg=Associação já existe');
    await StudyPlan.create({ course: curso, discipline: disciplina, ano, semestre });
    res.redirect('/gestor/plano_estudos?msg=Adicionado');
});
router.get('/plano_estudos/remove/:id', async (req, res) => {
    await StudyPlan.findByIdAndDelete(req.params.id);
    res.redirect('/gestor/plano_estudos?msg=Removido');
});

// Student forms validation
router.get('/fichas_alunos', async (req, res) => {
    const fichas = await StudentForm.find({ estado: { $in: ['submetida', 'aprovada', 'rejeitada'] } })
        .populate('id_aluno', 'nome')
        .populate('id_curso', 'nome_cursos')
        .sort('-data_submissao');
    res.render('gestor/studentForms', { fichas, message: req.query.msg });
});
router.post('/fichas_alunos/validate', async (req, res) => {
    const { id_ficha, acao, observacoes } = req.body;
    await StudentForm.findByIdAndUpdate(id_ficha, {
        estado: acao, // 'aprovada' or 'rejeitada'
        observacoes_gestor: observacoes,
        data_validacao: new Date(),
        id_gestor: req.session.userId
    });
    res.redirect('/gestor/fichas_alunos?msg=Ficha atualizada');
});

module.exports = router;
