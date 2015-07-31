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
    config = require('../config/config.js'),
    thetvdb = require('node-tvdb'),
    Show  = require('../models/Show'),
    User  = require('../models/User'),
    Quality  = require('../models/Quality'),
    Episode  = require('../models/Episode'),
    Network  = require('../models/Network'),
    ProcessedFile  = require('../models/ProcessedFile');

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

    app.get('/history', function(req, res){
        ProcessedFile.find({}).exec(function(err, processedFiles){
            res.render('history', {
                processedFiles: processedFiles
            });
        });
    });

    app.get('/comingSoon', function(req, res){
        Episode.find({
            airDate: {
                $gte: new Date(),
                $lt: (new Date()).setTime((new Date()).getTime() + 7 * 86400000)
            }
        }).populate('showId').sort('airDate').exec(function(err, episodes){
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            var groupedByDay = _.groupBy(episodes, function(episode) {
                return days[(new Date(episode.airDate)).getDay()];
            });
            res.render('comingSoon', {
            // res.send({
                days: groupedByDay
            });
        });
    });

    app.get('/poster/show/:showId', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/show.poster';
        fs.stat(filePath, function(err, stat) {
            if(err == null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        ensureExists(config.posterLocation  + '/show/' + req.params.showId + '/', 0744, function(err) {
                            tvdb = new thetvdb(config.apiKeys.thetvdb);
                            tvdb.getBanners(show.providers.thetvdbId, function(error, response) {
                                if(error) res.send(error);
                                var posters = _.where(response, {BannerType: 'poster'});
                                var file = fs.createWriteStream(filePath);
                                var request = http.get('http://www.thetvdb.com/banners/' + posters[0].BannerPath, function(response) {
                                    response.pipe(file);
                                    file.on('finish', function() {
                                        res.setHeader('Cache-Control', 'public, max-age=30672000');
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

    app.get('/poster/show/:showId/:seasonNumber', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/' + req.params.seasonNumber + '/season.poster';
        fs.stat(filePath, function(err, stat) {
            if(err == null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        ensureExists(config.posterLocation  + '/show/' + req.params.showId + '/' + req.params.seasonNumber + '/', 0744, function(err) {
                            tvdb = new thetvdb(config.apiKeys.thetvdb);
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
                                            res.setHeader('Cache-Control', 'public, max-age=30672000');
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

    app.get('/poster/show/:showId/:seasonNumber/:episodeNumber', function(req, res){
        var filePath = config.posterLocation  + '/show/' + req.params.showId + '/' + req.params.seasonNumber + '/' + req.params.episodeNumber + '.poster';
        fs.stat(filePath, function(err, stat) {
            if(err == null){
                res.sendFile(filePath);
            } else {
                Show.findOne({_id: req.params.showId}, function(err, show){
                    if(err) res.send({error: err});
                    if(show.providers.thetvdbId){
                        ensureExists(config.posterLocation  + '/show/' + req.params.showId + '/season/' + req.params.seasonNumber + '/', 0744, function(err) {
                            tvdb = new thetvdb(config.apiKeys.thetvdb);
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

    app.get('/play/:mediaType/:mediaId/*', function(req, res){

        // // ffmpeg -i video_source_file.ext -vcodec libx264 -vpre ipod640 -b 250k -bt 50k -acodec libfaac -ab 56k -ac 2 -s 480x320 video_out_file.mp4
        //
        // var path = '/Users/xo/Desktop/Paw\ Patrol\ -\ S02E17\ Pups\ and\ the\ Big\ Freeze.mp4';
        // var stat = fs.statSync(path);
        // var total = stat.size;
        // if (req.headers['range']) {
        //     var range = req.headers.range;
        //     var parts = range.replace(/bytes=/, "").split("-");
        //     var partialstart = parts[0];
        //     var partialend = parts[1];
        //
        //     var start = parseInt(partialstart, 10);
        //     var end = partialend ? parseInt(partialend, 10) : total-1;
        //     var chunksize = (end-start)+1;
        //     console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
        //
        //     var file = fs.createReadStream(path, {start: start, end: end});
        //     res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
        //     file.pipe(res);
        // } else {
        //     console.log('ALL: ' + total);
        //     res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
        //     fs.createReadStream(path).pipe(res);
        // }
        // var ffmpeg = require('fluent-ffmpeg');
        // ffmpeg(path).inputOptions('-codec:a aac -strict experimental -b:a 128k -vcodec mpeg4 -b:v 1200k -flags +aic+mv4 -movflags frag_keyframe+empty_moov').pipe(res);
        // var input_file = fs.createReadStream(path);
        // var child_process = require('child_process');
        // input_file.on('error', function(err) {
        //     console.log(err);
        // });
        //
        // var output_path = 'output.mp4';
        // var output_stream = fs.createWriteStream('output.mp4');
        //
        // var ffmpeg = child_process.spawn('ffmpeg', ['-i', 'pipe:0', '-f', 'mp4', '-movflags', 'frag_keyframe', 'pipe:1']);
        // input_file.pipe(ffmpeg.stdin);
        // ffmpeg.stdout.pipe(res);
        //
        // ffmpeg.stderr.on('data', function (data) {
        //     console.log(data.toString());
        // });
        //
        // ffmpeg.stderr.on('end', function () {
        //     console.log('file has been converted succesfully');
        // });
        //
        // ffmpeg.stderr.on('exit', function () {
        //     console.log('child process exited');
        // });
        //
        // ffmpeg.stderr.on('close', function() {
        //     console.log('...closing time! bye');
        // });
        res.send({
            error: 'Not finished yet!'
        });
    });

    return app;
})();
