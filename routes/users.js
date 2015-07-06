var passport = require('passport');
var flash = require('connect-flash');
/**
 * Signin after passport authentication
 */

exports.getUser = function(req, res, next) {

    if (!req.isAuthenticated()) {
        res.json('Acceso no Autorizado');
    } else {
        res.json(req.user);
    }

};

exports.signinRender = function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.render('signin', {
            messages: req.flash('error') || req.flash('info')
        });
    } else {
        res.redirect('/');
    }


};



exports.signin = function(req, res, next) {
    passport.authenticate('parse', function(err, user, info) {
        if (err || !user) {
            res.status(400).send(info);
        } else {
            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;

            req.login(user, function(err) {
                if (err) {
                    res.status(400).send(err);
                } else {
                    res.redirect('/');
                }
            });
        }
    })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/* GET users listing. */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        req.message = 'Usuario debe identificarse';
        req.denied = false;
        return next();
    } else {
        req.message = req.user;
        req.denied = true;
        return next();
    }
};

/**
 * User authorizations routing middleware
 */
exports.hasAuthorization = function(roles) {
    var _this = this;

    return function(req, res, next) {
        _this.requiresLogin(req, res, function() {
            if (_.intersection(req.user.roles, roles).length) {
                return next();
            } else {
                return res.status(403).send({
                    message: 'Usuario no esta autorizado'
                });
            }
        });
    };
};