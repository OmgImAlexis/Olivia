var mongoose = require('mongoose');

var qualitySchema = mongoose.Schema({
    title: String
});

module.exports = mongoose.model('Quality', qualitySchema);
