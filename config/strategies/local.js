var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	DashUser = require('mongoose').model('DashUsers');

module.exports = function() {
	passport.use(new LocalStrategy(function(username, password, done) {
		DashUser.findOne({ username: username}, function(err, user){
			if(err){
				return done(err);
			}
			
			if(!user){
				return done(null, false, {message: 'Usuario Desconocido'});
			}
			
			if(user.password !== password){  // !user.authenticate(password)
				return done(null, false, {message: 'Contraseña Inválida'});
			}else{
				console.log('contraseña valida');
			}
			
			return done(null, user);
		});
	}));
};