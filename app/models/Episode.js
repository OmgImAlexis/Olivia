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
    quality: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quality'
    },
    download: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Download'
    }
});

module.exports = mongoose.model('Episode', episodeSchema);
