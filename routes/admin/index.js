var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    _ = require('underscore'),
    config = require('../../config/config.js'),
    TVDB = require('node-tvdb'),
    tvdb = new TVDB(config.apiKeys.thetvdb),
    Show  = require('../../models/Show'),
    User  = require('../../models/User'),
    Quality  = require('../../models/Quality'),
    Episode  = require('../../models/Episode'),
    Download  = require('../../models/Download'),
    Network  = require('../../models/Network');

module.exports = (function() {
    var app = express.Router();

    app.get('/', function(req, res){
        Show.find({}).populate('quality network').exec(function(err, shows){
            async.each(shows, function (show, callback) {
                Download.count({showId: show._id, status: 'done'}).exec(function(err, downloadCount){
                    show.downloadCount = downloadCount;
                    Download.count({showId: show._id, status: 'snatched'}).exec(function(err, snatchedCount){
                        show.snatchedCount = snatchedCount;
                        Episode.count({showId: show._id}).exec(function(err, episodeCount){
                            show.episodeCount = episodeCount;
                            callback();
                        });
                    });
                });
            }, function(err) {
                res.render('admin/index', {
                    shows: shows
                });
            });
        });
    });

    app.all('/getShowInfo', function(req, res){
        var showName = req.body.showName || req.query.showName;
        var provider = req.body.provider || req.query.provider;
        var all = (req.body.all || req.query.all) ? true : false;
        if(provider == 'thetvdb') {
            var TVDB = require("node-tvdb");
            var tvdb = new TVDB(config.apiKeys.thetvdb);
            if(showName.trim() == ''){
                res.send({
                    error: 'No show entered?'
                });
            } else {
                tvdb.getSeriesByName(showName.trim(), function(err, response) {
                    if(err) res.send(err);
                    if(all){
                        tvdb.getSeriesAllById(response[0].seriesid, function(err, response){
                            res.send(response);
                        });
                    } else {
                        res.send(response);
                    }
                });
            }
        } else {
            res.send({
                error: 'That provider doesn\'t exist on this branch, maybe try switching to the dev branch?'
            });
        }
    });

    app.get('/logs', function(req, res){
        var logPath = path.resolve(__dirname, '../log.txt');
        fs.readFile(logPath, 'utf8', function (err, log) {
            if(err) console.log(err);
            res.render('admin/log', {
                log: log
            });
        });
    });

    app.get('/settings/general', function(req, res){
        res.render('admin/settings/index');
    });

    return app;
})();
