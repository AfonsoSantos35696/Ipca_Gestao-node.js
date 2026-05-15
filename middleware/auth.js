module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session.userId) return next();
    res.redirect('/login');
  },
  hasRole: (role) => (req, res, next) => {
    if (req.session.userRole === role) return next();
    // Redirect to appropriate dashboard
    if (req.session.userRole === 'aluno') return res.redirect('/aluno/dashboard');
    if (req.session.userRole === 'funcionario') return res.redirect('/funcionario/dashboard');
    if (req.session.userRole === 'gestor') return res.redirect('/gestor/dashboard');
    if (req.session.userRole === 'admin') return res.redirect('/admin/dashboard');
    res.redirect('/login');
  }
};