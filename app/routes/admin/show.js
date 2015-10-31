var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    models = require('models');

module.exports = (function() {
    var app = express.Router();

    app.get('/:showId', function(req, res){
        Show.findOne({_id: req.params.showId}).populate('seasons genres').exec(function(err, show){
            if(err) res.send(err);
            if(!show){
                res.send({
                    error: 'Show not found!'
                });
            } else {
                async.each(show.seasons, function (season, callback) {
                    season.populate({path: 'episodes'}, function(err, result){
                        if(err) console.log(err);
                        async.each(season.episodes, function (episode, callback) {
                            episode.populate({path: 'download'}, function(err, result){
                                if(err) console.log(err);
                                callback();
                            });
                        }, function(err){
                            callback();
                        });
                    });
                }, function (err) {
                    if(err) console.log(err);
                    res.render('admin/show', {
                        err: err,
                        show: show
                    });
                });
            }
        });
    });

    app.delete('/:showId', function(req, res){
        Show.findOne({ _id: req.params.showId }).exec(function (err, show) {
            if(show){
                show.remove(function (err) {
                    if(err) res.send(err);
                    res.send({message: 'Deleted'});
                });
            } else {
                res.send({
                    err: err,
                    message: 'No show found'
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
