var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    Show  = require('../../models/Show'),
    Season  = require('../../models/Season'),
    Episode  = require('../../models/Episode'),
    Tag  = require('../../models/Tag'),
    User  = require('../../models/User');

module.exports = (function() {
    var app = express.Router();

    app.get('/:showId', function(req, res){
        Show.findOne({_id: req.params.showId}).populate('seasons tags').exec(function(err, show){
            if(err) res.send(err);
            if(!show){
                res.send({
                    error: 'Show not found!'
                });
            } else {
                async.each(show.seasons, function (season, callback) {
                    season.populate({path: 'episodes'}, function(err, result){
                        if(err) console.log(err);
                            callback();
                    });
                }, function (err) {
                    res.render('show', {
                        err: err,
                        show: show
                    });
                });
            }
        });
    });

    app.get('/:showId/edit', function(req, res){
        Show.findOne({_id: req.params.showId}).exec(function(err, show){
            res.send(show);
        });
    });

    return app;
})();
