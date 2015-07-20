var mongoose = require('mongoose');

var episodeSchema = mongoose.Schema({
    showId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show'
    },
    episodeNumber: Number,
    seasonNumber: Number,
    title: String,
    airDate: Date,
    downloadStatus: String
});

module.exports = mongoose.model('Episode', episodeSchema);
