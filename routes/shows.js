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
    Genre  = require('../models/Genre'),
    User  = require('../models/User'),
    Network  = require('../models/Network');

module.exports = (function() {
    var app = express.Router();

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
            res.render('shows/comingSoon', {
            // res.send({
                days: groupedByDay
            });
        });
    });

    return app;
})();
