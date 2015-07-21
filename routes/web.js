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

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res){
        Show.find({}).populate('quality network').exec(function(err, shows){
            res.render('index', {
                shows: shows
            });
        });
    });

    app.get('/poster/:mediaType/:mediaId', function(req, res){
        if(req.params.mediaType == 'movie' || req.params.mediaType == 'show'){
            var filePath = config.posterLocation  + '/' + req.params.mediaType +'/' + req.params.mediaId;
            fs.stat(filePath, function(err, stat) {
                if(err == null){
                    res.sendFile(filePath);
                } else {
                    Show.findOne({_id: req.params.mediaId}, function(err, show){
                        if(err) res.send({error: err});
                        if(show.providers.thetvdbId){
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                var posters = _.where(response, {BannerType: 'poster'});
                                var file = fs.createWriteStream(config.posterLocation  + '/' + req.params.mediaType +'/' + req.params.mediaId);
                                var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                    response.pipe(file);
                                    file.on('finish', function() {
                                        res.sendFile(filePath);
                                    });
                                });
                            });
                        } else {
                            res.send({});
                        }
                    });
                }
            });
        } else {
            res.send('??');
        }
    });

    return app;
})();
