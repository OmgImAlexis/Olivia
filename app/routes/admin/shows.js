var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    nconf = require('nconf'),
    thetvdb = require('node-tvdb'),
    models = require('models');

module.exports = (function() {
    var app = express.Router(),
        tvdb = new thetvdb(nconf.get('apiKeys:thetvdb'));

    app.get('/new', function(req, res){
        res.render('admin/shows/new');
    });

    app.post('/new', function(req, res){
        if(req.body.provider == 'thetvdb') {
            Show.findOne({'providers.thetvdbId': req.body.seriesid}).exec(function(err, show){
                if(show){
                    res.redirect('/admin/show/' + show.id);
                } else {
                    tvdb.getSeriesAllById(req.body.seriesid, function(err, thetvdbShow) {
                        if(err) res.send(err);
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
                            function(network, callback){
                                var genres = [];
                                var thetvdbGenres = thetvdbShow.Genre.split('|').splice(1).slice(0, -1);
                                async.eachSeries(thetvdbGenres, function i(genreTitle, callback) {
                                    Genre.findOne({title: genreTitle}).exec(function(err, genre){
                                        if(err) callback(err);
                                        if(!genre) {
                                            genre = new Genre({
                                                title: genreTitle
                                            });
                                            genre.save();
                                        }
                                        genres.push(genre.id);
                                        callback();
                                    });
                                }, function done() {
                                    callback(null, network, genres);
                                });
                            },
                            function(network, genres, callback){
                                var actors = [];
                                var thetvdbActors = thetvdbShow.Actors.split('|').splice(1).slice(0, -1);
                                async.eachSeries(thetvdbActors, function i(actorName, callback) {
                                    Actor.findOne({name: actorName}).exec(function(err, actor){
                                        if(err) callback(err);
                                        if(!actor) {
                                            actor = new Actor({
                                                name: actorName
                                            });
                                            actor.save();
                                        }
                                        actors.push(actor.id);
                                        callback();
                                    });
                                }, function done() {
                                    callback(null, network, genres, actors);
                                });
                            },
                            function(network, genres, actors, callback) {
                                Show.findOne({title: req.body.SeriesName}).exec(function(err, show){
                                    if(err) res.send(err);
                                    if(!show) {
                                        show = new Show({
                                            providers: {
                                                thetvdbId: req.body.seriesid,
                                                imdbId: req.body.IMDB_ID,
                                                zap2itId: req.body.zap2it_id
                                            },
                                            title: req.body.SeriesName,
                                            overview: req.body.Overview,
                                            dayOfWeek: thetvdbShow.Airs_DayOfWeek,
                                            runTime: thetvdbShow.Runtime,
                                            rating: thetvdbShow.Rating,
                                            network: network.id,
                                            seasons: [],
                                            actors: actors,
                                            genres: genres
                                        });
                                        show.save();
                                    }
                                    callback(null, network, genres, actors, show);
                                });
                            }
                        ], function (err, network, genres, actors, show) {
                            if(err) res.send(err);
                            async.eachSeries(thetvdbShow.Episodes, function i(thetvdbEpisode, callback) {
                                Episode.findOne({showId: show.id, episodeNumber: thetvdbEpisode.Combined_episodenumber, seasonNumber: thetvdbEpisode.Combined_season}, function(err, episode){
                                    if(err) callback(err);
                                    if(!episode){
                                        episode = new Episode({
                                            showId: show.id,
                                            episodeNumber: thetvdbEpisode.Combined_episodenumber,
                                            seasonNumber: thetvdbEpisode.Combined_season,
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
                }
            });
        } else {
            res.send({
                error: 'That provider doesn\'t exist on this branch, maybe try switching to the dev branch?'
            });
        }
    });

    return app;
})();
