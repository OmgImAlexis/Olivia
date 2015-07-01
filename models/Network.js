var mongoose = require('mongoose');

var networkSchema = mongoose.Schema({
    title: String
});

module.exports = mongoose.model('Network', networkSchema);
