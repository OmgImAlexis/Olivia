var mongoose = require('mongoose');

var downloadSchema = mongoose.Schema({
    codec: String,
    type: {
        type: String,
        enum: ['episode', 'movie']
    },
    status: {
        type: String,
        enum: ['done', 'snatched']
    },
    language: [String],
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    episode: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Episode'
    },
    showId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Show'
    },
    releaseGroup: String,
    quality: String
});

module.exports = mongoose.model('Download', downloadSchema);
