var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    var probe = require('node-ffprobe');
                    probe(file, function(err, probeData) {
                        results.push(probeData);
                    });
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

walk('/Volumes/TV\ Shows/', function(err, results) {
    if (err) throw err;
    console.dir(results);
});
