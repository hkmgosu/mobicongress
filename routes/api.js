var parse = require('parse').Parse;
var config = require('../config/config');
var passport = require('passport');
var _ = require('underscore');
var moment = require('moment-timezone');
var Client = require('node-rest-client').Client;

client = new Client();

//parse.initialize(config.parse.appId,config.parse.jsKey,config.parse.masterKey);
// GET


exports.mobiapps = function(req, res) {

	if (req.isAuthenticated()) {
		var args;
		args = {

			//data:{test:"hello"}, // data passed to REST method (only useful in POST, PUT or PATCH methods) 
			//path:{"id":120}, // path substitution var 
			//parameters:{arg1:"hello",arg2:"world"}, // query parameter substitution vars 
			headers: {
				"X-Parse-Email": procces.env.PARSE_ACCOUNT_USER,
				"X-Parse-Password": process.env.PARSE_ACCOUNT_PASSWORD,
				"Content-Type": "application/json"

			} // request headers 
		};


		client.get("https://api.parse.com/1/apps", args,
			function(data, response) {
				mapps = JSON.parse(data);
				res.json(mapps.results);

			}).on('error', function(err) {
			res.json('something went wrong on the request', err.request.options);
		});



	} else {
		res.redirect('/signin');
	}

};


exports.mobiapps_get = function(req, res) {

	if (req.isAuthenticated()) {

		args = {

			//data:{test:"hello"}, // data passed to REST method (only useful in POST, PUT or PATCH methods) 
			//path:{"id":120}, // path substitution var 
			//parameters:{arg1:"hello",arg2:"world"}, // query parameter substitution vars 
			headers: {
				"X-Parse-Email": procces.env.PARSE_ACCOUNT_USER,
				"X-Parse-Password": process.env.PARSE_ACCOUNT_PASSWORD,
				"Content-Type": "application/json"

			} // request headers 
		};


		client.get("https://api.parse.com/1/apps/" + req.params.mobiapp_id, args,
			function(data, response) {
				mapp = JSON.parse(data);


				args = {
					headers: {
						"X-Parse-Application-Id": mapp.applicationId,
						"X-Parse-Master-Key": mapp.masterKey,
						"Content-Type": "application/json"
					} // request headers 
				};

				client.get("https://api.parse.com/1/schemas", args, function(data, response) {
					mschemas = JSON.parse(data);
					parse.initialize(mapp.applicationId, mapp.javascriptKey, mapp.masterKey);
					//res.json(mschemas.results);
					var className = [];

					_.each(mschemas.results, function(value, key) {
						if (value.className != "_Installation") {
							if (value.className != "_Session")
								className.push({
									className: value.className
								});
						}
					});

					res.json({
						applicationId: mapp.applicationId,
						javascriptKey: mapp.javascriptKey,
						masterKey: mapp.masterKey,
						classes: className
					});


				}).on('error', function(err) {
					res.json('schemas: something went wrong on the request', err.request.options);
				});


			}).on('error', function(err) {
			res.json('something went wrong on the request', err.request.options);
		});


	} else {
		res.json('/signin');
	}

};


exports.core_config = function(req, res) {

	if (req.isAuthenticated()) {

		var Core = parse.Object.extend("Core");
		var query = new parse.Query(Core);
		//query.equalTo("class", req.body.classname);
		query.find().then(function(results) {
			res.json({config: results});
		});

	} else {
		res.redirect('/signin');
	}

};


exports.class_find_rows = function(req, res) {

	if (req.isAuthenticated()) {

		var Core = parse.Object.extend("Core");
		var query = new parse.Query(Core);
		query.equalTo("class", req.body.classname);
		query.find().then(function(results) {

			var web_config = results[0];
			var clobj = parse.Object.extend(req.body.classname);
			var query = new parse.Query(clobj);


			if (_.has(req.body, "includes")) {

				var classData = [];
				query.include(req.body.includes);
				query.limit(1000);
				query.find().then(function(data) {

					for (var i = 0; i < data.length; i++) {
						classData.push({
							classdata: data[i],
							includes: []
						});

						if (req.body.includes.length !== 0) {
							for (var j = 0; j < req.body.includes.length; j++) {
								classData[i].includes.push({
									classname: req.body.includes[j],
									classdata: data[i].get(req.body.includes[j])
								});
								//console.log(classData[i].includes);
							}
						}
					}

					res.json({
						classname: req.body.classname,
						config: web_config,
						classdata: classData
					});



				}, function(error) {
					res.json("Error: " + error.code + " " + error.message);
				});

			} else {
				query.limit(1000);
				query.find().then(function(data) {

					res.json({
						classname: req.body.classname,
						config: web_config,
						classdata: data
					});

				}, function(error) {
					res.json("Error: " + error.code + " " + error.message);
				});
			}




		});


	} else {
		res.redirect('/signin');
	}

};

exports.prueba = function(req, res) {
	
	var results;
	var includes = ['apunta'];

	var Prueba = new parse.Object.extend("Prueba");
	var query = new parse.Query(Prueba);
	query.include(includes);

	query.find().then(function(data) {
		_.each(data, function(value, key) {
			if (key == includes[0]) {
				value = value.get('apunta');
			}
		});
		res.json(data);
	});

};



exports.class_new_row = function(req, res) {

	if (req.isAuthenticated()) {

		var Clobj = parse.Object.extend(req.body.classname);
		var new_row = new Clobj();

		_.each(req.body.info, function(value, key) {
			//new_row.set(key, value);
			if (_.has(value, "value")) {
				if (value.type == 'String' && value.value !== null) {
					new_row.set(key, value.value);
				} else if (value.type == 'Date' && value.value !== null) {
					new_row.set(key, new Date(value.value));
				} else if (value.type == 'Pointer' && value.value !== null) {
					new_row.set(key, {
						"__type": value.type,
						"className": value.targetClass,
						"objectId": value.value
					});
				} else if (value.type == 'Array' && value.value !== null) {
					if (value.value.length > 0) {
						var tempArray = [];
						for (var i = 0; i < value.value.length; i++) {
							tempArray.push({
								"__type": value.type,
								"className": value.targetClass,
								"objectId": value.value[0]
							});
						}
						new_row.set(key, tempArray);
					}
				}
			}
		});

		new_row.save().then(function(data) {
			res.json(data);
		}, function(error) {
			res.json("Error: " + error.code + " " + error.message);
		});

		//res.json(req.body);


	} else {
		res.json('/signin');
	}

};



exports.class_update_row = function(req, res) {

	if (req.isAuthenticated()) {
		var Event = parse.Object.extend("Event");
		var query = new parse.Query(Event);

		query.get(req.params.event_id, {
			success: function(eventup) {
				eventup.save(null, {
					success: function(data) {

						data.set("title", req.body.title);
						data.set("detail", req.body.detail);
						data.set("start", new Date(req.body.start));
						data.set("end", new Date(req.body.end));
						data.save()
					}
				});

			},
			error: function(data, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.
				res.json('Failed to get object, with error code: ' + error.message + ' objectId: ' + req.params.event_id);
			}
		});

	} else {
		res.json('/signin');
	}

};


exports.class_delete_row = function(req, res) {

	if (req.isAuthenticated()) {
		var Clobj = parse.Object.extend(req.body.classname);
		var query = new parse.Query(Clobj);

		query.get(req.body.object_id, {
			success: function(data) {
				// Execute any logic that should take place after the object is saved.
				data.destroy({});
				res.json('Deleted objectId: ' + req.body.object_id);
			},
			error: function(data, error) {
				// Execute any logic that should take place if the save fails.
				// error is a Parse.Error with an error code and message.
				res.json('Failed to get object, with error code: ' + error.message);
			}
		});

	} else {
		res.json('/signin');
	}

};