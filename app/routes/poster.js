var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    _ = require('underscore'),
    http = require('http'),
    fs = require('fs'),
    util = require('util'),
    mkdirp = require('mkdirp'),
    nconf = require('nconf'),
    thetvdb = require('node-tvdb'),
    models = require('models');

module.exports = (function() {
    var app = express.Router(),
        tvdb = new thetvdb(nconf.get('apiKeys:thetvdb'));

    app.get('/show/:showId', function(req, res){
        var filePath = path.resolve(__dirname + '/tmp/posters/show/' + req.params.showId + '/show.' + (req.query.type == 'banner' ? 'banner' : 'poster'));
        fs.stat(filePath, function(err, stat) {
            if(err === null){
                res.sendFile(filePath, {
                    maxAge: 30672000
                });
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        mkdirp(path.resolve(__dirname + '/tmp/posters/show/' + req.params.showId + '/'), function(err) {
                            if(err) console.error(err);
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                if(error) res.send(error);
                                var posters = _.where(response, { BannerType: (req.query.type == 'banner' ? 'series' : 'poster') });
                                if(posters.length){
                                    var file = fs.createWriteStream(filePath);
                                    var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                        response.pipe(file);
                                        file.on('finish', function() {
                                            res.sendFile(filePath, {
                                                maxAge: 30672000
                                            });
                                        });
                                    });
                                } else {
                                    filePath = path.resolve(__dirname + '/tmp/posters/placeholder.png');
                                    res.sendFile(filePath, {
                                        maxAge: 30672000
                                    });
                                }
                            });
                        });
                    } else {
                        res.send({
                            error: 'Not supported'
                        });
                    }
                });
            }
        });
    });

    app.get('/show/:showId/:seasonNumber', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/' + req.params.seasonNumber + '/season.poster';
        fs.stat(filePath, function(err, stat) {
            if(err === null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        mkdirp(config.posterLocation  + '/show/' + req.params.showId + '/' + req.params.seasonNumber + '/', function(err) {
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                var posters = _.where(response, {BannerType: 'season', Season: req.params.seasonNumber});
                                var file = fs.createWriteStream(filePath);
                                if(posters.length) {
                                    var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                        response.pipe(file);
                                        file.on('finish', function() {
                                            res.sendFile(filePath, {
                                                maxAge: 30672000
                                            });
                                        });
                                    });
                                } else {
                                    filePath = config.posterLocation  + '/placeholder.png';
                                    res.sendFile(filePath, {
                                        maxAge: 30672000
                                    });
                                }
                            });
                        });
                    } else {
                        res.send({
                            error: 'Not supported'
                        });
                    }
                });
            }
        });
    });

    app.get('/show/:showId/:seasonNumber/:episodeNumber', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/' + req.params.seasonNumber + '/' + req.params.episodeNumber + '.poster';
        fs.stat(filePath, function(err, stat) {
            if(err === null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        mkdirp(config.posterLocation  + '/show/' + req.params.showId + '/season/' + req.params.seasonNumber + '/', function(err) {
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                var posters = _.where(response, {BannerType: 'season', Season: req.params.seasonNumber});
                                var file = fs.createWriteStream(filePath);
                                // if(posters.length) {
                                //     var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                //         response.pipe(file);
                                //         file.on('finish', function() {
                                //             res.sendFile(filePath);
                                //         });
                                //     });
                                // } else {
                                    filePath = config.posterLocation  + '/placeholder.png';
                                    res.sendFile(filePath, {
                                        maxAge: 30672000
                                    });
                                // }
                            });
                        });
                    } else {
                        res.send({
                            error: 'Not supported'
                        });
                    }
                });
            }
        });
    });

    return app;
})();
