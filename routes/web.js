var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    User  = require('../models/User');

var shows = [];

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res){
        res.render(shows);
    });

    app.get('/process', function(req, res){
        var fs = require('fs');
        var path = require('path');
        var walk = function(dir, done) {
            fs.readdir(dir, function(err, list) {
                if (err) return done(err);
                var pending = list.length;
                if (!pending) return done(null, shows);
                list.forEach(function(file) {
                    file = path.resolve(dir, file);
                    fs.stat(file, function(err, stat) {
                        if (stat && stat.isDirectory()) {
                            walk(file, function(err, res) {
                                shows = shows.concat(res);
                                if (!--pending) done(null, shows);
                            });
                        } else {
                            var probe = require('node-ffprobe');

                            probe(file, function(err, probeData) {
                                shows.push(probeData);
                            });

                            if (!--pending) done(null, shows);
                        }
                    });
                });
            });
        };
        walk('/Volumes/TV\ Shows/', function(err, shows) {
            if (err) throw err;
        });
        res.send(200);
    });

    return app;
})();
