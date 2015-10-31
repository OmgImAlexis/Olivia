var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    fs = require('fs'),
    http = require('http'),
    path = require('path'),
    _ = require('underscore'),
    nconf = require('nconf'),
    thetvdb = require('node-tvdb'),
    models = require('models');

module.exports = (function() {
    var app = express.Router(),
        tvdb = new thetvdb(nconf.get('apiKeys:thetvdb'));

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
            if(showName.trim() === ''){
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
            log.error({
                status: '404',
                pageUrl: req.originalUrl
            });
        }
    });

    app.get('/logs', function(req, res){
        res.send({error: 'Nope!'});
    });

    app.get('/settings/general', function(req, res){
        res.render('admin/settings/index');
    });

    return app;
})();
