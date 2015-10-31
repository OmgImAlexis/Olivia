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
        Show.findOne({_id: req.params.showId}).populate('seasons genres downloads').exec(function(err, show){
            if(err) res.send(err);
            if(!show){
                res.send({
                    error: 'Show not found!'
                });
            } else {
                async.each(show.seasons, function (season, callback) {
                    season.populate({path: 'episodes'}, function(err, result){
                        season.episodes = season.episodes.filter(function(episode){
                            return episode.download ? episode : false;
                        });
                        callback();
                    });
                }, function (err) {
                    show.seasons = show.seasons.filter(function(season){
                        return season.episodes.length ? season : false;
                    });
                    res.render('show', {
                        err: err,
                        show: show
                    });
                });
            }
        });
    });

    app.get('/:showId/:seasonNumber', function(req, res){
        Season.findOne({showId: req.params.showId, seasonNumber: req.params.seasonNumber}).populate('episodes').exec(function(err, season){
            season.episodes = season.episodes.filter(function(episode){
                return episode.download ? episode : false;
            });
            res.render('season', {
                showId: req.params.showId,
                season: season
            });
        });
    });

    return app;
})();
