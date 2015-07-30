## Olivia


```
var path = require('path');

var config = {}

config.env = {};
config.db = {};
config.apiKeys = {};

config.title = 'tv and movie thing';
config.posterLocation = path.resolve(__dirname, '../posters/');

config.env.port = process.env.PORT || 3000;
config.db.uri = process.env.DB_URI || 'mongodb://localhost:27017/tv';

config.apiKeys.thetvdb = 'ABCDEFGHIJKLM123456789';

module.exports = config;
```
