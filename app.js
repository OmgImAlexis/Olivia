var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    logger = require('express-logger'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    passport = require('passport'),
    config = require('./config/config.js'),
    User = require('./models/User'),
    Show = require('./models/Show');

mongoose.connect(config.db.uri, function(err){
    if(err){
        console.log('Is mongodb running?');
        process.exit();
    }
});

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public', {
    maxAge: '30672000'
}));
app.use(logger({path: './log.txt'}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
    secret: 'keyboard cat',
    name: 'session',
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next){
    res.locals.user = req.user;
    res.locals.title = config.title;
    res.locals.currentPath = req.originalUrl;
    next();
});

// User views
app.use('/', require('./routes/web'));
app.use('/show', require('./routes/show'));

// Admin views
app.use('/admin', require('./routes/admin'));
app.use('/admin/show', require('./routes/admin/show'));
app.use('/admin/shows', require('./routes/admin/shows'));
app.use('/admin/movies', require('./routes/admin/movies'));

// API views
app.use('/api', require('./routes/api'));

app.use(function(req, res, next){
    res.status(404).send('Either we lost this page or you clicked an incorrect link!');
});

fs.writeFile('./log.txt', '', function(){
    console.log('Log file emptied.');
});

app.listen(config.env.port, function() {
    console.log('Express server listening on port %s', config.env.port);
});
