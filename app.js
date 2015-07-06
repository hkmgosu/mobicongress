var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var api = require('./routes/api');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var config = require('./config');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// oniwi!!!

// Strategies
var ParseStrategy = require('passport-parse');

//parse
var parse = require('parse').Parse;
parse.User.enableRevocableSession();
parse.initialize(config.parse.appId, config.parse.jsKey, config.parse.masterKey);


var parseStrategy = new ParseStrategy({
    parseClient: parse
});

passport.use(parseStrategy);

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

app.use(session({
    secret: config.session.secret,
    key: 'sid',
    cookie: {
        secure: false
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// Setting up the users authentication api
app.route('/signin').get(users.requiresLogin, users.signinRender).post(passport.authenticate('parse', {
    successRedirect: '/',
    failureRedirect: '/signin',
    failureFlash: true
}));
app.route('/signout').get(users.signout);



///


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Página no encontrada');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;