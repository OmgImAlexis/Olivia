var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    Show  = require('../models/Show'),
    Season  = require('../models/Season'),
    Episode  = require('../models/Episode'),
    Genre  = require('../models/Genre'),
    User  = require('../models/User'),
    Network  = require('../models/Network');

module.exports = (function() {
    var app = express.Router();

    return app;
})();
