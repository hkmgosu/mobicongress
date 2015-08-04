var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var api = require('../routes/api');
var passport = require('passport');
var compression = require('compression');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
require('../models/dashuser.server.model.js');
var config = require('./config');
var routes = require('../routes/index.js');


var app = express();


module.exports = function() {
  // Crear una nueva instancia de la aplicación Express
  var app = express();

  // Usar la variable 'NODE_ENV' para activar los middleware 'morgan' logger o 'compress'
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else if (process.env.NODE_ENV === 'production') {
    app.use(compress());
  }

  // Usar las funciones middleware 'body-parser' y 'method-override'
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

// Configurar el middleware 'session'
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret
  }));

// Configurar el motor view de la aplicación y el directorio 'views'
  app.set('views', './views');
  app.set('view engine', 'ejs');

  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());
	
 // Cargar los archivos de enrutamiento
  app.use('/', routes);


  // Configurar el servidor de archivos estáticos
  app.use(express.static('./public'));

  // Devolver la instancia de la aplicación Express
  return app;
};