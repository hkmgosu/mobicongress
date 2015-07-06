var express = require('express');
var router = express.Router();
var users = require('./users');
var flash = require('connect-flash');
var passport = require('passport');
var api = require('./api');


/* GET home page. */
router.get('/', users.requiresLogin, function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/signin');
    } else {
        res.render('index', {
            message: req.flash('success')
        });
    }
});

router.get('/api/getuser', users.requiresLogin, users.getUser);

router.get('/api/mobiapps', users.requiresLogin, api.mobiapps);

router.get('/api/mobiapps_get/:mobiapp_id', users.requiresLogin, api.mobiapps_get);

router.post('/api/class_find_rows/', users.requiresLogin, api.class_find_rows);

router.post('/api/class_new_row', users.requiresLogin, api.class_new_row);

router.post('/api/class_update_row/:object_id', users.requiresLogin, api.class_update_row);

router.post('/api/class_delete_row/', users.requiresLogin, api.class_delete_row);


module.exports = router;