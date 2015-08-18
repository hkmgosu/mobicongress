var express = require('express');
var users = require('../controllers/dashusers.server.controller');
var flash = require('connect-flash');
var passport = require('passport');
var api = require('./api');
var router = express.Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

 module.exports = function(app){ 
	
	/* 	app.route('/signup')
	.get(users.renderSignup)
	.post(users.signup); */

	app.get('/', users.requiresLogin, function(req, res, next) {
		if (!req.isAuthenticated()) {
			res.redirect('/signin');
		} else {
			/* 			if(req.session.lastVisit){
				console.log(req.session.lastVisit);
			}
			req.session.lastVisit = new Date(); */
			res.render('index', {
				message: req.flash('success')
			});
		}
	});


	app.route('/signin')
		.get(users.renderSignin)
		.post(passport.authenticate('local', {
			successRedirect: '/',
			failureRedirect: '/signin',
			failureFlash: true
		}));

	app.get('/signout', users.signout);

	app.get('/api/getuser', users.requiresLogin, users.getUser);

	app.get('/api/mobiapps', users.requiresLogin, api.mobiapps);

	app.get('/api/core_config', users.requiresLogin, api.core_config);

	app.get('/api/mobiapps_get/:mobiapp_id', users.requiresLogin, api.mobiapps_get);

	app.post('/api/class_find_rows/', users.requiresLogin, api.class_find_rows);

	app.post('/api/class_new_row', users.requiresLogin, multipartMiddleware, api.class_new_row);

	app.post('/api/class_update_row/', users.requiresLogin, multipartMiddleware, api.class_update_row);

	app.post('/api/class_delete_row/', users.requiresLogin, api.class_delete_row);

	app.get('/api/prueba/', api.prueba);

 	app.post('/test', multipartMiddleware, function(req, res, next) {
		console.log(req.files);
		res.json(JSON.parse(req.body.info));
	}); 
	
}; 