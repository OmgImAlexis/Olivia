var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    Show  = require('../models/Show'),
    User  = require('../models/User');

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res){
        res.send('Welcome to the tv api.');
    });

    app.get('/shows', function(req, res){
        Show.find({disabled: false}).exec(function(err, shows){
            res.send({
                shows: shows
            });
        });
    });

    return app;
})();
