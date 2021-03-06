/* global Episode:true */
/* global Show:true */
/* global Download:true */

var express  = require('express'),
    async = require('async'),
    fs = require('fs'),
    _ = require('underscore'),
    fs = require('fs'),
    guessit = require('guessit-wrapper'),
    mv = require('mv'),
    nconf = require('nconf'),
    kat = require('kat-api'),
    async = require('async'),
    guessit = require('guessit-wrapper');

// Makes sure the dir exists if not it makes it.
function ensureExists(path, mask, cb) {
    if (typeof mask === 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0755;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code === 'EEXIST') {
                cb(null); // ignore the error if the folder already exists
            } else {
                cb(err); // something else went wrong
            }
        } else {
            cb(null); // successfully created folder
        }
    });
}

function walkSync(dir, filelist) {
    if( dir[dir.length-1] !== '/'){
        dir = dir.concat('/');
    }
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
        filelist = filelist || [];

    files.forEach(function(file) {
        if (fs.statSync(dir + file).isDirectory()) {
            filelist = walkSync(dir + file + '/', filelist);
        } else {
            filelist.push(dir+file);
        }
    });
    return filelist;
}

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
                if(err) { console.log(err); }
                shows = shows.filter(function(show){
                    return show.downloadCount + show.snatchedCount > 0 ? show : '';
                });
                res.render('index', {
                    shows: shows
                });
            });
        });
    });

    app.get('/history', function(req, res){
        Download.find({}).sort('_id').populate('episode movie').exec(function(err, downloads){
            async.each(downloads, function (download, callback) {
                if(download.episode){
                    download.episode.populate({path: 'showId'}, function(err){
                        if(err) { console.log(err); }
                        callback();
                    });
                } else {
                    callback();
                }
            }, function (err) {
                if(err) { console.log(err); }
                res.render('history', {
                    downloads: downloads
                });
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
            var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            var groupedByDay = _.groupBy(episodes, function(episode) {
                return days[(new Date(episode.airDate)).getDay()];
            });
            res.render('comingSoon', {
                days: groupedByDay
            });
        });
    });

    app.get('/postProcess', function(req, res){
        var unProcessed = [];
        var processed = [];
        var downloadPath = nconf.get('path:download');
        var processedPath = nconf.get('path:processed');
        var files = walkSync(downloadPath);
        async.eachSeries(files, function i(file, callback) {
            var originalFile = file;
            file = file.replace(downloadPath,'');
            file = file.split('/');
            file = file[file.length-1];
            guessit.parseName(file).then(function (data) {
                if(data.mimetype === 'text/plain' || data.type === 'episodeinfo'){
                    console.log('Not episode or movie.');
                    callback();
                } else if(data.type === 'episode'){
                    Show.findOne({ titleLowerCase: (data.year ? data.series + ' (' + data.year + ')' : data.series).toLowerCase() }).exec(function(err, show){
                        if(err) { console.log(err); }
                        if(show){
                            async.eachSeries((data.episodeList ? data.episodeList : [data.episodeNumber]), function i(dataEpisode, callback) {
                                Episode.findOne({showId: show.id, episodeNumber: dataEpisode, seasonNumber: data.season}).exec(function(err, episode){
                                    if(err) { console.log(err); }
                                    if(episode){
                                        var download = new Download({
                                            codec: data.videoCodec,
                                            type: 'episode',
                                            language: data.language,
                                            showId: show.id,
                                            episode: episode.id,
                                            releaseGroup: data.releaseGroup,
                                            quality: data.format,
                                            status: 'done'
                                        });
                                        console.log(data.format);
                                        download.save(function(err, download){
                                            if(err) { console.log(err); }
                                            if(download){
                                                console.log('Saved download');
                                                episode.download = download.id;
                                                episode.save(function(err, episode){
                                                    ensureExists(processedPath + show.title + '/', 0744, function(err) {
                                                        if(err) { console.log(err); }
                                                        if((data.episodeList && data.episodeList.indexOf(dataEpisode) === data.episodeList.length-1 ) || data.episodeNumber){
                                                            mv(originalFile, processedPath + show.title + '/S' + ('0' + episode.seasonNumber).slice(-2) + 'E' + ('0' + dataEpisode).slice(-2) + ' - ' + episode.title + '.' + data.container, function(err) {
                                                                if(err) { console.log(err); }
                                                                processed.push({
                                                                    file: file,
                                                                    download: download,
                                                                    data: data
                                                                });
                                                                callback();
                                                            });
                                                        } else {
                                                            processed.push({
                                                                file: file,
                                                                download: download,
                                                                data: data
                                                            });
                                                            callback();
                                                        }
                                                    });
                                                });
                                            } else {
                                                console.log('Couldn\'t save download.');
                                                callback();
                                            }
                                        });
                                    } else {
                                        console.log('Couldn\'t find episode: S' +  data.season + 'E' + dataEpisode);
                                        unProcessed.push({
                                            file: file,
                                            data: data
                                        });
                                        callback();
                                    }
                                });
                            }, function done(){
                                callback();
                            });
                        } else {
                            console.log('Didn\'t find show: ' + data.series);
                            callback();
                        }
                    });
                } else {
                    console.log('Data type:' + data.type);
                    callback();
                }
            });
        }, function done() {
            console.log('done');
            res.send({
                unProcessed: unProcessed,
                processed: processed,
                files: files
            });
        });
    });

    app.get('/manualSearch', function(req, res){
        Episode.find({
            airDate: {
                $gte: new Date(),
                $lt: (new Date()).setTime((new Date()).getTime() + 7 * 86400000)
            }
        }).populate('showId quality').sort('airDate').lean().exec(function(err, episodes){
            var wanted = [],
                notWanted = [];
            episodes.forEach(function(episode){
                kat.search({
                    query: episode.showId.title,
                    category: 'tv',
                    season: episode.seasonNumber,
                    minSeeds: '1',
                    sortBy: 'seeders',
                    order: 'desc',
                    language: 'en'
                }).then(function(data) {
                    async.each(data.results, function(torrent, callback) {
                        guessit.parseName(torrent.title).then(function(guess) {
                            var wantedQuality = episode.quality.map(function(item){
                                return item.title;
                            });
                            if(wantedQuality.indexOf(guess.format) > -1){
                                wanted.push({
                                    guess: guess,
                                    torrent: torrent
                                });
                                callback(null);
                            } else {
                                notWanted.push({
                                    guess: guess,
                                    torrent: torrent
                                });
                                callback(null);
                            }
                        });
                    }, function(err) {
                        if(err) {
                            console.log("There was an error" + err);
                        } else {
                            res.send({
                                wanted: wanted,
                                notWanted: notWanted
                            });

                            console.log('wanted: ', wanted.length);
                            console.log('notWanted: ', notWanted.length);
                        }
                    });

                });
            });
        });
    });

    return app;
})();
