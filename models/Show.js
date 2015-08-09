var mongoose = require('mongoose');

var showSchema = mongoose.Schema({
    title: String,
    titleLowerCase: String,
    overview: String,
    status: {
        type: String,
        default: 'Downloading'
    },
    dayOfWeek: {
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    runTime: {
        type: Number
    },
    rating: {
        type: Number
    },
    specialsHidden: {
        type: Boolean,
        default: false
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
    genres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre'
    }],
    actors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Actor'
    }],
    providers: {
        thetvdbId: String,
        imdbId: String,
        zap2itId: String
    }
});

showSchema.pre('save', function(next){
    this.titleLowerCase = this.title.toLowerCase();
    next();
});

module.exports = mongoose.model('Show', showSchema);
