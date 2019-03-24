var passport = require('passport');

const MidWare = require('../middleware');

module.exports = function (app) {
    app.get('/', MidWare.authenticate, function (req, res) {
        if(req.user.ytConnected) {
            res.redirect('/converter');
        } else {
            res.redirect('/youtube')
        }
    });

    app.get('/converter', MidWare.authenticate, function(req, res) {
        res.render('converter', {step : 1});
    })

    app.get('/login', function (req, res) {
        res.render('login', { message: req.flash('loginMessage') });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/register', function (req, res) {
        res.render('register', { message: req.flash('signupMessage') });
    });

    app.post('/register', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/register',
        failureFlash: true
    }));

    app.post('/logout', function (req, res) {
        req.logout();
        res.redirect('/login');
    });
}