var mongoose = require('mongoose');

var actorSchema = mongoose.Schema({
    name: String
});

module.exports = mongoose.model('Actor', actorSchema);
