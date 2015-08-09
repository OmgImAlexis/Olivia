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
    downloads: {
        done: {
            type: Number,
            default: 0
        },
        pending: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        }
    }
});

module.exports = mongoose.model('Season', seasonSchema);
