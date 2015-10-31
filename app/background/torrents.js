var kat = require('kat-api'),
    mongoose = require('mongoose'),
    nconf = require('nconf'),
    _ = require('underscore'),
    models = require('../models');

nconf.use('memory');
nconf.argv().env().file({ file: './config.json' });

mongoose.connect('mongodb://' + nconf.get('database:host') + ':' + nconf.get('database:port') + '/' + nconf.get('database:collection'), function(err){
    if(err){ console.log('Cannot connect to mongodb, please check your config.json'); process.exit(1); }
});

Episode.find({
    airDate: {
        $gte: new Date(),
        $lt: (new Date()).setTime((new Date()).getTime() + 7 * 86400000)
    }
}).populate('showId').sort('airDate').lean().exec(function(err, episodes){
    episodes.forEach(function(episode){
        kat.search({
            imdb: 'tt4422836',
            category: 'tv',
            min_seeds: '1',
            sort_by: 'seeders',
            order: 'desc',
            language: 'en'
        }).then(function (data) {
            console.log(data);
        }).catch(function (error) {
            console.log(error);
        });
    });
});
//
// _id: [Object],
//       showId: [Object],
//       episodeNumber: 7,
//       seasonNumber: 1,
//       title: 'Brian Finch\'s Black Op',
//       airDate: Tue Nov 03 2015 10:30:00 GMT+1030 (ACDT),
//       __v: 0 }
