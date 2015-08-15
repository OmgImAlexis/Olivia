var mongoose = require('mongoose');

var seasonSchema = mongoose.Schema({
    showId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show'
    },
    seasonNumber: Number,
    episodes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Episode'
    }],
    downloads: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Download'
    }]
});

module.exports = mongoose.model('Season', seasonSchema);
