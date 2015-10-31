var express = require('express'),
    http = require('http'),
    nconf = require('nconf'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    logger = require('express-logger'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    open = require("open"),
    compression = require('compression'),
    passport = require('passport'),
    User = require('./app/models/User'),
    Show = require('./app/models/Show');

nconf.use('memory');
nconf.argv().env().file({ file: './config.json' });

mongoose.connect('mongodb://' + nconf.get('database:host') + ':' + nconf.get('database:port') + '/' + nconf.get('database:collection'), function(err){
    if(err){ console.log('Cannot connect to mongodb, please check your config.json'); process.exit(1); }
});

var app = express();

app.disable('x-powered-by');

app.set('views', __dirname + '/app/views');
app.set('view engine', 'jade');
app.use(compression());
app.use(express.static(__dirname + '/public', { maxAge: 86400000 }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({
    secret: nconf.get('session:secret'),
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
    res.locals.title = nconf.get('web:title');
    res.locals.currentPath = req.originalUrl;
    next();
});

// User views
app.use('/', require('./app/routes/web'));
app.use('/show', require('./app/routes/show'));
app.use('/shows', require('./app/routes/shows'));

// Admin views
app.use('/admin', require('./app/routes/admin'));
app.use('/admin/show', require('./app/routes/admin/show'));
app.use('/admin/shows', require('./app/routes/admin/shows'));
app.use('/admin/movies', require('./app/routes/admin/movies'));

// Backend views
app.use('/poster', require('./app/routes/poster'));

// API views
app.use('/api', require('./app/routes/api'));

app.use(function(req, res, next){
    res.status(404).send('Either we lost this page or you clicked an incorrect link!');
});

http.createServer(app).listen(nconf.get('web:port'), '0.0.0.0', function(){
    // open("http://localhost:" + config.env.httpPort); // Should only be used for production if user has enabled in config
});
