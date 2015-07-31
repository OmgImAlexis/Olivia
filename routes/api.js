var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    Show  = require('../models/Show'),
    Movie  = require('../models/Movie'),
    User  = require('../models/User');

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res){
        res.send('Welcome Olivia\'s api.');
    });

    app.get('/shows', function(req, res){
        Show.find({}).populate('seasons actors').exec(function(err, shows){
            async.each(shows, function (show, callback) {
                async.each(show.seasons, function (season, callback) {
                    season.populate({path: 'episodes'}, function(err, result){
                        if(err) console.log(err);
                        callback();
                    });
                }, function(){
                    callback();
                });
            }, function (err) {
                res.send({
                    shows: shows
                });
            });
        });
    });

    app.get('/movies', function(req, res){
        Movie.find({}).exec(function(err, movies){
            res.send({
                movies: movies
            });
        });
    });

    return app;
})();
