var express  = require('express'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    async = require('async'),
    _ = require('underscore'),
    Movie  = require('../models/Movie'),
    User  = require('../models/User');

module.exports = (function() {
    var app = express.Router();

    return app;
})();
