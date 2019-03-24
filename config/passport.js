var LocalStrategy = require('passport-local').Strategy;

var User = require('../db/schemas/user.schema.js');

module.exports = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // ============================= LOCAL SIGNUP ==============================
    // =========================================================================

    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, username, password, done) {

            process.nextTick(function () {

                User.findOne({ 'local.username': username }, function (err, user) {
                    if (err)
                        return done(err);
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                    } else {

                        var newUser = new User();

                        newUser.local.username = username;
                        newUser.local.password = newUser.generateHash(password);
                        newUser.local.email = req.body.email;
                        
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));


    // =========================================================================
    // ============================= LOCAL LOGIN ===============================
    // =========================================================================

    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true 
    },
    function(req, username, password, done) { 

        User.findOne({ 'local.username' :  username }, function(err, user) {
            if (err)
                return done(err);

            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found with that username'));

            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Incorrect password.'));

            return done(null, user);
        });

    }));
};