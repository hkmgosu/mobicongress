var parse = require('parse').Parse;
var config = require('../config/config');
var passport = require('passport');
var _ = require('underscore');
var moment = require('moment-timezone');
var Client = require('node-rest-client').Client;
var fs = require('fs');

client = new Client();

var parse_user = config.PARSE_ACCOUNT_USER;
var parse_password = config.PARSE_ACCOUNT_PASSWORD;

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
				"X-Parse-Email": parse_user,
				"X-Parse-Password": parse_password,
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
		
		var parseAppIdUri = "https://api.parse.com/1/apps/" + req.params.mobiapp_id;
		var args = { headers: { "X-Parse-Email": parse_user, "X-Parse-Password": parse_password, "Content-Type": "application/json"} };


		client.get(parseAppIdUri, args, function(data, response) {
			var mapp = JSON.parse(data);
			parse.initialize(mapp.applicationId, mapp.javascriptKey, mapp.masterKey);
			var Core = parse.Object.extend("Core");
			var query = new parse.Query(Core);
			query.equalTo('active', true);
			var total = [];
			query.find().then(function(results) {
				console.log("configuraciones encontradas: " + results.length);
				var loop = [];
				_.each(results, function(result){
						var object = result;
						var classname = object.get('class');
						var clobj = parse.Object.extend(classname);
						var query = new parse.Query(clobj);
						loop.push(query);
				});
				return (loop);
			}).then(function(querys){
				var promise1 = parse.Promise.as();
				_.each(querys, function(value){
					promise1 = promise1.then(function() {
						console.log('queries guardadas, guardando el resultado---: ' + value.className);
						return value.count({
								success: function(num) {
								console.log({classname: value.className, total:num});
								  total.push({classname: value.className, total:num});
								},
								error: function(error) {
								  console.log(error);
								}
							});
					});
				});
				 return promise1;
			}).then(function(){
				res.json(total);
			});
				

/* 				res.json({
					applicationId: mapp.applicationId,
					javascriptKey: mapp.javascriptKey,
					masterKey: mapp.masterKey,
					classes: className
				}); */
			

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
			
			if(_.has(req.body, "object_id")){
				query.equalTo("objectId", req.body.object_id);
			}


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
	
	parse.initialize('9tD2T3fGEHCRRsJC0d8gpoCUfO0YitjA57yh9zx0', 'vtDA5yKehtBTZRVsDU1oc3w7DCfbBg0G6QuZwqNM', 'ZZww6q3qf7IfTNQsSr9kpgX9BxfNs5jtGd1W1l6B');
	
	var Entidad1 = parse.Object.extend("Entidad1");
	var Entidad2 = parse.Object.extend("Entidad2");
	var Entidad3 = parse.Object.extend("Entidad3");
	var qe1 = [];var qe2 = [];var qe3 = [];
	var r1 = []; var r2 = []; var r3 = [];
	for(var i = 8001; i<= 10000; i++){
		var entidad1 = new Entidad1();
		var entidad2 = new Entidad2();
		var entidad3 = new Entidad3();
		entidad1.set("texto", "objeto"+i);
		entidad1.set("booleano",true);
		entidad1.set("numero",i);
		entidad1.set("fecha", new Date());
		entidad1.set("keyValue",{ 'key': 'value'+i});
		qe1.push(entidad1);
		entidad2.set("texto", "objeto"+i);
		entidad2.set("booleano",true);
		entidad2.set("numero",i);
		entidad2.set("fecha", new Date());
		entidad2.set("keyValue",{ 'key': 'value'+i});
		qe2.push(entidad2);
		entidad3.set("texto", "objeto"+i);
		entidad3.set("booleano",true);
		entidad3.set("numero",i);
		entidad3.set("fecha", new Date());
		entidad3.set("keyValue",{ 'key': 'value'+i});
		qe3.push(entidad3);
	}
	
	_.each(qe1, function(e1){
		setTimeout(function(){ 
			e1.save().then(function(){
			console.log("guardado: " + e1.get('numero'));
		});	 
		}, 50);
	}); 

	res.json('ño');
	
	
/* 	
var totalRows1 = [];
var final1 = [];
query1.count().then(function(num){
		var total = num;
		var limit = 1000;
		var skip = 0;
		var querys = [];
		do{
			if(total >= limit){
				query1.limit(limit);
				query1.skip(skip);
				total = total - limit;
				skip = skip + limit;
				querys.push(query1);
			}else
			{
				query1.limit(total);
				total = 0;
				querys.push(query1);
			}
		}while(total >= limit);
		
		return querys;
	}).then(function(querys){
		var promise1 = parse.Promise.as();
			_.each(querys, function(value){
				promise1 = promise1.then(function() {
					console.log('queries guardadas, guardando el resultado---: ' + value.className);
					return value.find({
							success: function(data) {
							console.log(data.length);
							  totalRows1.push(data);
							},
							error: function(error) {
							  console.log(error);
							}
						});
				});
			});
		return promise1;
	}).then(function(){
		_.each(totalRows1, function(arrayData){
			_.each(arrayData, function(row){
				return final1.push(row);
			});
		});
	}).then(function(){
		console.log("filas Entidad1 extraidas exitosamente ---> " + final1.length);
	}); */
	
	
	
};



exports.class_new_row = function(req, res) {

	if (req.isAuthenticated()) {
		
		var Clobj = parse.Object.extend(req.body.classname);
		var new_row = new Clobj();

		_.each(JSON.parse(req.body.info), function(value, key) {
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
								"objectId": value.value[i]
							});
						}
						new_row.set(key, tempArray);
					}
				}
			}
		});
		
		_.each(req.files, function(value, key){
			console.log(req.files);
			console.log(value.path);
			if(value.path !== undefined){
				var fileData = fs.readFileSync(value.path);
				fileData = Array.prototype.slice.call(new Buffer(fileData), 0);
				var parseFile = new parse.File(value.name, fileData);
				new_row.set(key, parseFile);
			}
			
		});

		new_row.save().then(function(data) {
			res.json({type: 'success', title: 'SUCCESS!', detail: req.body.classname + ' guardado exitosamente'});
		}, function(error) {
			res.json({type: 'error', title: 'ERROR! no se ha guardado el objeto ' + req.body.classname, detail: "Error: " + error.code + " " + error.message});
		});


	} else {
		res.json('/signin');
	}

};



exports.class_update_row = function(req, res) {

	if (req.isAuthenticated()) {
		console.log(JSON.parse(req.body.info).objectId.value);
		var Clobj = parse.Object.extend(req.body.classname);
		var query = new parse.Query(Clobj);

		query.get(JSON.parse(req.body.info).objectId.value, {
			success: function(classup) {
				classup.save(null, {
					success: function(new_row) {

						_.each(JSON.parse(req.body.info), function(value, key) {
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
												"objectId": value.value[i]
											});
										}
										new_row.set(key, tempArray);
									}
								}
							}
						});

						_.each(req.files, function(value, key){
							console.log(value.path);
							var fileData = fs.readFileSync(value.path);
							fileData = Array.prototype.slice.call(new Buffer(fileData), 0);
							var parseFile = new parse.File(value.name, fileData);
							new_row.set(key, parseFile);

						});

						new_row.save().then(function(data) {
							res.json({type: 'success', title: 'SUCCESS!', detail: req.body.classname + ' guardado exitosamente'});
						}, function(error) {
							res.json({type: 'error', title: 'ERROR! no se ha guardado el objeto ' + req.body.classname, detail: "Error: " + error.code + " " + error.message});
						});
						
						
						
						
						
						
						
					}
				});

			},
			error: function(data, error) {
				res.json({type: 'error', title: 'ERROR! no se ha guardado el objeto ' + req.body.classname, detail: "Error: " + error.code + " " + error.message});
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
				res.json({type: 'success', title: 'Success!',detail: 'Deleted ' + req.body.classname });
			},
			error: function(data, error) {
				res.json({type: 'error', title: 'ERROR! no se borrado el objeto ' + req.body.classname, detail: "Error: " + error.code + " " + error.message});
			}
		});

	} else {
		res.json('/signin');
	}

};