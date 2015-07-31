var mongoose = require('mongoose');

var processedFileSchema = mongoose.Schema({
    name: String,
    path: String,
    mediaType: {
        type: String,
        enum: ['Show', 'Movie', 'Song']
    }
});

module.exports = mongoose.model('ProcessedFile', processedFileSchema);
