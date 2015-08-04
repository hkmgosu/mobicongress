var express = require('express');
var users = require('../controllers/dashusers.server.controller');
var flash = require('connect-flash');
var passport = require('passport');
var api = require('./api');
var router = express.Router();

/* GET home page. */
/* app.get('/', users.requiresLogin, function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/signin');
    } else {
		if(req.session.lastVisit){
			console.log(req.session.lastVisit);
		}
		req.session.lastVisit = new Date();
        res.render('index', {
            message: req.flash('success')
        });
    }
}); */

/* module.exports = function(app){ */
	
	/* 	app.route('/signup')
	.get(users.renderSignup)
	.post(users.signup); */

/* 	app.get('/', users.requiresLogin, function(req, res, next) {
		if (!req.isAuthenticated()) {
			res.redirect('/signin');
		} else { */
/* 			if(req.session.lastVisit){
				console.log(req.session.lastVisit);
			}
			req.session.lastVisit = new Date(); */
/* 			res.render('index', {
				message: req.flash('success')
			});
		}
	}); */

	//Configurar las routes 'signin'
/* 	app.route('/signin')
		.get(users.renderSignin)
		.post(passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/signin',
		failureFlash: true
		})); */

	//Configurar la route 'signout'
/* 	app.get('/signout', users.signout);
	
	app.get('/api/getuser', users.requiresLogin, users.getUser);

	app.get('/api/mobiapps', users.requiresLogin, api.mobiapps);

	app.get('/api/core_config', users.requiresLogin, api.core_config);

	app.get('/api/mobiapps_get/:mobiapp_id', users.requiresLogin, api.mobiapps_get);

	app.get('/api/class_find_rows/', users.requiresLogin, api.class_find_rows);

	app.post('/api/class_new_row', users.requiresLogin, api.class_new_row);

	app.get('/api/class_update_row/:object_id', users.requiresLogin, api.class_update_row);

	app.post('/api/class_delete_row/', users.requiresLogin, api.class_delete_row);

	app.get('/api/prueba/', api.prueba);
	
}; */

router.get('/', users.requiresLogin, function(req, res, next) {
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

	//Configurar las routes 'signin'
	router.route('/signin')
		.get(users.renderSignin)
		.post(passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/signin',
		failureFlash: true
		}));

	//Configurar la route 'signout'
	router.get('/signout', users.signout);

router.get('/api/getuser', users.requiresLogin, users.getUser);

router.get('/api/mobiapps', users.requiresLogin, api.mobiapps);

router.get('/api/core_config', users.requiresLogin, api.core_config);

router.get('/api/mobiapps_get/:mobiapp_id', users.requiresLogin, api.mobiapps_get);

router.post('/api/class_find_rows/', users.requiresLogin, api.class_find_rows);

router.post('/api/class_new_row', users.requiresLogin, api.class_new_row);

router.post('/api/class_update_row/:object_id', users.requiresLogin, api.class_update_row);

router.post('/api/class_delete_row/', users.requiresLogin, api.class_delete_row);

router.get('/api/prueba/', api.prueba);


module.exports = router;