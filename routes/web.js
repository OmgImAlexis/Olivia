var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    config = require('../config/config.js'),
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
            res.sendFile(config.posterLocation  + '/' + req.params.mediaType +'/' + req.params.mediaId);
        } else {
            res.send('??');
        }
    });

    app.get('/logs', function(req, res){
        res.send(404);
    });

    app.get('/settings/general', function(req, res){
        res.send(404);
    });

    return app;
})();
