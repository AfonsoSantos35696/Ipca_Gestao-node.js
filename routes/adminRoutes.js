const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { hasRole } = require('../middleware/auth');

router.use(hasRole('admin'));

// Dashboard
router.get('/dashboard', async (req, res) => {
  const total = await User.countDocuments();
  const alunos = await User.countDocuments({ role: 'aluno' });
  const funcionarios = await User.countDocuments({ role: 'funcionario' });
  const gestores = await User.countDocuments({ role: 'gestor' });
  const admins = await User.countDocuments({ role: 'admin' });
  res.render('admin/dashboard', { total, alunos, funcionarios, gestores, admins });
});

// List users
router.get('/users', async (req, res) => {
  const users = await User.find().sort({ role: 1, nome: 1 });
  res.render('admin/users', { users, message: req.query.msg, error: null });
});

// Add user
router.post('/users/add', async (req, res) => {
  const { nome, email, password, role } = req.body;
  if (!nome || !email || !password || !role) {
    return res.redirect('/admin/users?msg=Preencha todos os campos');
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ nome, email, password: hashed, role });
    await newUser.save();
    res.redirect('/admin/users?msg=Utilizador adicionado');
  } catch (err) {
    res.redirect('/admin/users?msg=Erro: email pode já existir');
  }
});

// Edit user
router.post('/users/edit', async (req, res) => {
  const { id, nome, email, role, password } = req.body;
  try {
    const updateData = { nome, email, role };
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await User.findByIdAndUpdate(id, updateData);
    res.redirect('/admin/users?msg=Utilizador atualizado');
  } catch (err) {
    res.redirect('/admin/users?msg=Erro ao atualizar');
  }
});

// Delete user
router.get('/users/delete/:id', async (req, res) => {
  const id = req.params.id;
  if (id == req.session.userId) {
    return res.redirect('/admin/users?msg=Não pode eliminar a sua própria conta');
  }
  await User.findByIdAndDelete(id);
  res.redirect('/admin/users?msg=Utilizador eliminado');
});

module.exports = router;