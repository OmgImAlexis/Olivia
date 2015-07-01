var mongoose = require('mongoose');

var showSchema = mongoose.Schema({
    title: String,
    status: {
        type: String,
        default: 'Downloading'
    },
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
    },
    quality: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quality'
    },
    network: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Network'
    },
    seasons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Season'
    }],
    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
    }]
});

module.exports = mongoose.model('Show', showSchema);
