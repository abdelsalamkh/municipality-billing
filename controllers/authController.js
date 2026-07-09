const bcrypt = require('bcrypt');
const authService = require('../services/authService');

exports.loginPage = (req, res) => {

    if (req.session.user) {
        return res.redirect('/dashboard');
    }

    res.render('auth/login', {
        error: null
    });
};

exports.login = async (req, res) => {

    try {

        const { username, password } = req.body;

        const user = await authService.findByUsername(username);

        if (!user) {
            return res.render('auth/login', {
                error: 'Invalid username or password.'
            });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.render('auth/login', {
                error: 'Invalid username or password.'
            });
        }

        if (!user.active) {

            return res.render('auth/login', {
        
                error: 'تم إيقاف هذا المستخدم.'
        
            });
        
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            username: user.username,
            role: user.role
        };

        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }

};

exports.logout = (req, res) => {

    req.session.destroy(() => {
        res.redirect('/login');
    });

};