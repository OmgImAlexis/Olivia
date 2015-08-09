var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    Show  = require('../models/Show'),
    Season  = require('../models/Season'),
    Episode  = require('../models/Episode'),
    Genre  = require('../models/Genre'),
    User  = require('../models/User');

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
                    if(season.downloads.done > 0){
                        season.populate({path: 'episodes'}, function(err, result){
                            if(err) console.log(err);
                            callback();
                        });
                    } else {
                        delete show.seasons[show.seasons.indexOf(season)];
                        callback();
                    }
                }, function (err) {
                    function cleanArray(actual){
                        var newArray = new Array();
                        for(var i = 0; i<actual.length; i++){
                            if (actual[i]){
                            newArray.push(actual[i]);
                            }
                        }
                        return newArray;
                    }
                    show.seasons = cleanArray(show.seasons);
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
            res.render('season', {
                showId: req.params.showId,
                season: season
            });
        });
    });

    return app;
})();
