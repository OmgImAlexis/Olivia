var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    _ = require('underscore'),
    config = require('../config/config.js'),
    TVDB = require('node-tvdb'),
    tvdb = new TVDB(config.apiKeys.thetvdb),
    Show  = require('../models/Show'),
    User  = require('../models/User'),
    Quality  = require('../models/Quality'),
    Network  = require('../models/Network');

// Makes sure the dir exists if not it makes it.
function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res){
        Show.find({}).populate('quality network').exec(function(err, shows){
            res.render('index', {
                shows: shows
            });
        });
    });

    app.get('/poster/show/:showId', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/show';
        fs.stat(filePath, function(err, stat) {
            if(err == null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        ensureExists(config.posterLocation  + '/show/' + req.params.showId + '/', 0744, function(err) {
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                var posters = _.where(response, {BannerType: 'poster'});
                                var file = fs.createWriteStream(filePath);
                                var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                    response.pipe(file);
                                    file.on('finish', function() {
                                        res.sendFile(filePath);
                                    });
                                });
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

    app.get('/poster/show/:showId/season/:seasonNumber', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/season/' + req.params.seasonNumber;
        fs.stat(filePath, function(err, stat) {
            if(err == null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        ensureExists(config.posterLocation  + '/show/' + req.params.showId + '/season/', 0744, function(err) {
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                var posters = _.where(response, {BannerType: 'season', Season: req.params.seasonNumber});
                                var file = fs.createWriteStream(filePath);
                                if(posters.length) {
                                    var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                        response.pipe(file);
                                        file.on('finish', function() {
                                            res.sendFile(filePath);
                                        });
                                    });
                                } else {
                                    var posters =  _.where(response, {BannerType: 'poster'});
                                    var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                        response.pipe(file);
                                        file.on('finish', function() {
                                            res.sendFile(filePath);
                                        });
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

    return app;
})();
