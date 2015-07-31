var mongoose = require('mongoose');

var genreSchema = mongoose.Schema({
    title: String,
    url: String
});

module.exports = mongoose.model('Genre', genreSchema);
