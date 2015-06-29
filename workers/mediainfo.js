var mediainfo = require("mediainfo");
process.on('message', function(filePath) {
    mediainfo(filePath, function(err, info) {
        if (err) return console.log(err);
        process.send(info);
    });
});
