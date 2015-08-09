var mongoose = require('mongoose');

var downloadSchema = mongoose.Schema({
    format: String,
    codec: String,
    type: {
        type: String,
        enum: ['episode', 'movie']
    },
    language: [String],
    episode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Episode'
    },
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie'
    },
    releaseGroup: String,
    quality: String
});

module.exports = mongoose.model('Download', downloadSchema);
