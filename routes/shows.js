var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    config = require('../config/config.js'),
    Show  = require('../models/Show'),
    Season  = require('../models/Season'),
    Episode  = require('../models/Episode'),
    Tag  = require('../models/Tag'),
    User  = require('../models/User'),
    Network  = require('../models/Network');

module.exports = (function() {
    var app = express.Router();

    app.get('/new', function(req, res){
        res.render('shows/new');
    });

    app.post('/new', function(req, res){
        if(req.body.provider == 'thetvdb') {
            var TVDB = require("node-tvdb");
            var tvdb = new TVDB(config.apiKeys.thetvdb);

            async.waterfall([
                function(callback) {
                    Network.findOne({title: req.body.Network}).exec(function(err, network){
                        if(err) callback(err);
                        if(!network) {
                            network = new Network({
                                title: req.body.Network
                            });
                            network.save();
                        }
                        callback(null, network);
                    });
                },
                function(network, callback) {
                    Show.findOne({title: req.body.SeriesName}).exec(function(err, show){
                        if(err) res.send(err);
                        if(!show) {
                            var show = new Show({
                                providers: {
                                    thetvdbId: req.body.seriesId,
                                    imdbId: req.body.IMDB_ID,
                                    zap2itId: req.body.zap2it_id
                                },
                                title: req.body.SeriesName,
                                overview: req.body.Overview,
                                network: network.id,
                                seasons: []
                            });
                            show.save();
                        }
                        callback(null, network, show);
                    });
                }
            ], function (err, network, show) {
                if(err) res.send(err);
                tvdb.getSeriesAllById(req.body.seriesid, function(err, response) {
                    if(err) res.send(err);
                    async.eachSeries(response.Episodes, function i(thetvdbEpisode, callback) {
                        Episode.findOne({showId: show.id, episodeNumber: thetvdbEpisode.Combined_episodenumber, seasonNumber: thetvdbEpisode.Combined_season}, function(err, episode){
                            if(err) callback(err);
                            if(!episode){
                                episode = new Episode({
                                    showId: show.id,
                                    episodeNumber: thetvdbEpisode.Combined_episodenumber,
                                    title: thetvdbEpisode.EpisodeName,
                                    airDate: new Date(thetvdbEpisode.FirstAired),
                                    downloadStatus: 'Not downloaded?'
                                });
                                episode.save();
                                Season.findOne({showId: show.id, seasonNumber: thetvdbEpisode.Combined_season}, function(err, season){
                                    if(err) callback(err);
                                    if(!season){
                                        season = new Season({
                                            showId: show.id,
                                            seasonNumber: thetvdbEpisode.Combined_season,
                                            episodes: []
                                        });
                                        show.seasons.push(season);
                                    }
                                    season.episodes.push(episode);
                                    season.save(function(err, season){
                                        show.save(function(err, show){
                                            console.log('Season: ' + thetvdbEpisode.Combined_season + ' Episode: ' + thetvdbEpisode.Combined_episodenumber);
                                            callback();
                                        });
                                    });
                                });
                            } else {
                                callback();
                            }
                        });
                    }, function done() {
                        if(err) res.send(err);
                        res.redirect('/show/' + show._id);
                    });
                });
            });
        } else {
            res.send({
                error: 'That provider doesn\'t exist on this branch, maybe try switching to the dev branch?'
            });
        }
    });

    return app;
})();
