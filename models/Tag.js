var mongoose = require('mongoose');

var tagSchema = mongoose.Schema({
    name: String,
    url: String
});

module.exports = mongoose.model('Tag', tagSchema);
