require('dotenv').config();
const express = require('express');
const connectDB = require('./db/connection');
const sessionConfig = require('./middleware/sessionConfig');
const { isAuthenticated } = require('./middleware/auth');

const app = express();

// Connect to MongoDB and start server
const startServer = async () => {
    await connectDB();

    // Middleware
    app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(sessionConfig);
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

// Make session data available in all views
app.use((req, res, next) => {
    res.locals.user = req.session;
    next();
});

// Routes
app.use('/', require('./routes/publicRoutes'));      // login, signup, logout
app.use('/admin', isAuthenticated, require('./routes/adminRoutes'));
app.use('/gestor', isAuthenticated, require('./routes/gestorRoutes'));
app.use('/funcionario', isAuthenticated, require('./routes/funcionarioRoutes'));
app.use('/aluno', isAuthenticated, require('./routes/alunoRoutes'));

// Home redirect
app.get('/', (req, res) => {
    if (req.session.userId) {
        return res.redirect(`/${req.session.userRole}/dashboard`);
    }
    res.redirect('/login');
});
};

const PORT = process.env.PORT || 3000;
startServer().then(() => {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
});