var mongoose = require('mongoose');

var showSchema = mongoose.Schema({
    title: String
});

module.exports = mongoose.model('Show', showSchema);
