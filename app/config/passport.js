var bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    async = require('async'),
    User  = require('../models/User');

exports = module.exports = function(app, passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id).exec(function (err, user) {
                done(err, user);
        });
    });

    passport.use('local-signin', new LocalStrategy(function(username, password, done) {
        User.findOne({userame: username}, function(err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
            user.comparePassword(password, function(err, isMatch) {
                if (err) return done(err);
                if(isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            });
        });
    }));

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        process.nextTick(function() {
            User.findOne({username: username}, function(err, user) {
                if (err) return done(err);
                if (user) {
                    return done(null, false, { message: 'That username is already taken.' });
                } else {
                    user = new User({
                        username: username,
                        email: req.body.email,
                        password: password
                    });
                    user.save(function(err, user) {
                        if (err) throw err;
                        return done(null, user);
                    });
                }
            });
        });
    }));
};
