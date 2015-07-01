var mongoose = require('mongoose');

var movieSchema = mongoose.Schema({
    title: String
});

module.exports = mongoose.model('Movie', movieSchema);
