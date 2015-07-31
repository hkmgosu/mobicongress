var passport = require('passport'),
	mongoose = require('mongoose');

module.exports = function() {
	var DashUser = mongoose.model('DashUsers');

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		DashUser.findOne({
			_id: id
		}, '-password -salt', function(err, user) {
			done(err, user);
		});
	});
	
	require('./strategies/local.js')();
};