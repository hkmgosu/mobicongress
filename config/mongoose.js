var config = require('./config'),
	mongoose = require('mongoose'),
	uriUtil = require('mongodb-uri');

module.exports = function(){
	
	var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };       
 
	/*
	 * Mongoose uses a different connection string format than MongoDB's standard.
	 * Use the mongodb-uri library to help you convert from the standard format to
	 * Mongoose's format.
	 */
	var mongodbUri = config.MONGOLAB_URI;
	var mongooseUri = uriUtil.formatMongoose(mongodbUri);

	mongoose.connect(mongooseUri, options);
	
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function callback () {
		
		console.log('conectado a la base de datos');
		
/* 		var usuarioSchema = mongoose.Schema({
		username: String,
		password: String
		});

		var Usuario = mongoose.model('dashusers', usuarioSchema);

		var usuario = new Usuario({
			username: 'admin',
			password: 'mobicongress0199'
		});
		
		usuario.save(); */
		
	});
	
	require('../models/dashuser.server.model.js');
	  
	
	
};