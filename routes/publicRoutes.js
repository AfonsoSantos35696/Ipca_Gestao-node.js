const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const fs = require('fs');
const Course = require('../models/Course');
const Discipline = require('../models/Discipline');


// Login page
router.get('/login', (req, res) => {
    process.stderr.write('GET /login called\n');
    if (req.session.userId) return res.redirect('/');
    res.render('login', { error: null, email: '', role: '' });
});

// Login post
router.post('/login', async (req, res) => {
    process.stderr.write('POST /login called\n');
    process.stderr.write('req.body: ' + JSON.stringify(req.body) + '\n');
    const { email, password, role } = req.body || {};
    const trimmedEmail = email ? email.trim() : '';
    const trimmedRole = role ? role.trim() : '';

    process.stderr.write(`Login attempt: email="${trimmedEmail}", role="${trimmedRole}"\n`);

    if (!req.body) {
        return res.render('login', {
            error: 'Dados de login não foram enviados.',
            email: '',
            role: ''
        });
    }
    try {
        const user = await User.findOne({ 
            email: trimmedEmail.toLowerCase(), 
            role: trimmedRole 
        });
        console.log('User found:', !!user);
        if (user) {
            console.log('User email:', user.email, 'role:', user.role);
            console.log('Stored hash:', user.password);
            const passMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', passMatch);
        }
        if (user && await bcrypt.compare(password, user.password)) {
            console.log(`Login success for user: ${user.email}`);
            req.session.userId = user._id;
            req.session.userName = user.nome;
            req.session.userRole = user.role;
            return res.redirect(`/${user.role}/dashboard`);
        }
        console.log(`Login failed for email: ${trimmedEmail}`);
        res.render('login', {
            error: 'Email, palavra-passe ou perfil inválidos.',
            email: trimmedEmail,
            role: trimmedRole
        });
    } catch (err) {
        console.error('Login error:', err);
        res.render('login', {
            error: 'Erro no servidor: ' + err.message,
            email: email || '',
            role: role || ''
        });
    }
});

// Signup page
router.get('/signup', (req, res) => {
    if (req.session.userId) return res.redirect('/');
    res.render('signup', { error: null, success: null, nome: '', email: '', role: '' });
});

// Signup post
router.post('/signup', async (req, res) => {
    const { nome, email, password, confirmar_password, role } = req.body || {};
    if (!req.body) {
        return res.render('signup', {
            error: 'Dados de registo não foram enviados.',
            success: null,
            nome: '',
            email: '',
            role: ''
        });
    }
    if (password !== confirmar_password) {
        return res.render('signup', {
            error: 'As palavras-passe não coincidem.',
            success: null,
            nome: nome || '',
            email: email || '',
            role: role || ''
        });
    }
    if (password.length < 6) {
        return res.render('signup', {
            error: 'A palavra-passe deve ter pelo menos 6 caracteres.',
            success: null,
            nome: nome || '',
            email: email || '',
            role: role || ''
        });
    }
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.render('signup', {
            error: 'Email já registado.',
            success: null,
            nome: nome || '',
            email: email || '',
            role: role || ''
        });
        const hashed = await bcrypt.hash(password, 10);
        const newUser = new User({ nome, email, password: hashed, role });
        await newUser.save();
        res.render('signup', { error: null, success: 'Conta criada com sucesso! Já pode fazer login.', nome: '', email: '', role: '' });
    } catch (err) {
        res.render('signup', {
            error: 'Erro ao criar conta.',
            success: null,
            nome: nome || '',
            email: email || '',
            role: role || ''
        });
    }
});

// Endpoint para listar todas as UCs de um curso
router.get('/courses/:id/ucs', async (req, res) => {
    try {
        const courseId = req.params.id;
        
        // Buscar o curso
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Curso não encontrado' });
        }
        
        // Buscar todas as UCs com courseId igual ao ID do curso
        const ucs = await Discipline.find({ courseId: courseId }).populate('courseId');
        
        // Retornar curso e ucs
        res.json({
            course,
            ucs
        });
    } catch (error) {
        console.error('Erro ao listar UCs do curso:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Logout
router.get('/logout', (req, res) => {

    req.session.destroy();
    res.redirect('/login');
});

module.exports = router;
