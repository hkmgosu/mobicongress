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


exports.prueba = function(req, res) {
	
	/* parse.initialize('a96tn47pbH5wTAVUSH0zid1hL4Auk35MF3hVgDGj', 'zSdHAQqmnBrQDk7YJFeN97m9mVZtOXGzPamI8wF0', 'qaOgONgVqDIOMZjvwB65mQwC6CIwswwCLB0a6Kd2');
	
 	var classname = req.body.classname;
	var promise = new parse.Promise.as();
	promise.then(function(){
		
		var Core = parse.Object.extend("Core");
		var query = new parse.Query(Core);
		query.select("find");
		query.equalTo("class", classname);
		return query.find().then(function(results) {
						var find = results[0].get('find');
						return find;
				});
		
	}).then(function(find){
		var parseObject = parse.Object.extend(classname);
		var query = new parse.Query(parseObject);
		if(_.has(req.body, "object_id")){
			query.equalTo("objectId", req.body.object_id);
		}
		query.limit(1000);
		_.each(find.details, function(config){
			if(config.type == 'Pointer'){
				query.include(config.name);
			}
		});
		return query.find().then(function(result){
			var final = [];
			_.each(result, function(row){
				var pass = {};
				_.each(find.details, function(config){
					if(config.type == 'Pointer'){
						if(row.get(config.name) != null){
							pass[config.name] = { objectId: row.get(config.name).id, value: row.get(config.name).get('name') };
						}
					}else{
						pass[config.name] = row.get(config.name);
					}
				});
				final.push(pass);
			});
			return final;
		});
	}).then(function(final){
		console.log(final);
		res.json(final);
	});
	
	
	
	/*
	var arrayImg = [], numero= 9, inicial = 8001, final = 9000;
	query.equalTo("numero", numero);
	query.equalTo("texto", "base");
	query.find().then(function(img){
		for(var i = inicial; i<= final; i++){
			var imagen = new Imagen();
			imagen.set("imagen", img[0].get("imagen"));
			imagen.set("numero", i);
			imagen.set("texto", "imagen"+i);
			arrayImg.push(imagen);
		}
		console.log(img[0].get("imagen"));
	}).then(function(){
		parse.Object.saveAll(arrayImg).then(function(res){ console.log("Guardados..." + res.length);});
	});  
	
	*/
	

	
	/*var Imagen = parse.Object.extend("Imagen");
	var query = new parse.Query(Imagen);
	query.limit(1);
	var arrayImg = [];
	query.find().then(function(resp){
		console.log(resp.length);
		var ini = 1, fin = 1, num=0;
		for(var i = ini; i <= fin; i++){
			var imagen = new Imagen();
			var file = resp[num].get("imagen");
			imagen.set("imagen", file);
			imagen.set("numero", i);
			imagen.set("texto","imagen"+i);
			arrayImg.push(imagen);
		}
	}).then(function(){
		parse.initialize('9tD2T3fGEHCRRsJC0d8gpoCUfO0YitjA57yh9zx0', 'vtDA5yKehtBTZRVsDU1oc3w7DCfbBg0G6QuZwqNM', 'ZZww6q3qf7IfTNQsSr9kpgX9BxfNs5jtGd1W1l6B');
		parse.Object.saveAll(arrayImg).then(function(da){ console.log("saved " + da.length); res.json(da.get('numero')); });
	}); 
	*/
	
	
 
	/*	query.greaterThanOrEqualTo("numero", 1001);
	query.lessThanOrEqualTo("numero", 2000);
	query.notEqualTo("texto", "base");
	query.count().then(function(num){ console.log(num); }); */
	
/*	var limit = 500;
	var skip = 0;
	var Entidad1 = parse.Object.extend("Entidad1");
	var Entidad2 = parse.Object.extend("Entidad2");
	var Entidad3 = parse.Object.extend("Entidad3");
	var q1 = new parse.Query("Entidad1"), q2 = new parse.Query("Entidad2"), q3 = new parse.Query("Entidad3");
	q1.limit(limit); q2.limit(limit); q3.limit(limit);
	q1.skip(skip); q2.skip(skip); q3.skip(skip);
	q1.ascending("numero"); q2.ascending("numero"); q3.ascending("numero");
	var arr1 = [], arr2 = [], arr3 = [], arrImg = [];
	var promise = new parse.Promise.as();
	var array100 = [];
	
	promise.then(function(){
		var Imagen = parse.Object.extend("Imagen");
		var query = new parse.Query(Imagen);
		query.limit(limit);
		query.skip(skip);
		query.ascending("numero");
		return query.find().then(function(imgs){
			console.log("imgs " + imgs.length);
			_.each(imgs, function(img){
				arrImg.push(img);
			});
			for(var i = 0; i<100; i++){
				console.log(arrImg[i].id);
				array100.push({"__type":"Pointer", "className": "Imagen", "objectId": arrImg[i].id});
			}
		});	  
	}).then(function(){

		return q1.find({
			success: function(results) {
				
				_.each(results, function(re1){
					arr1.set("array100", array100);
					arr1.push(re1);
				});
		  },
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
		  }
		});


	}).then(function(){

		 return q2.find({
		  success: function(results) {
			_.each(results, function(re2){
				arr2.push(array100);
				arr2.push(re2);
			});	
		  },
		  error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		  }
		});  


	}).then(function(){

		return q3.find({
		  success: function(results) {
			_.each(results, function(re3){
					arr3.push(array100);
					arr3.push(re3);
				});
		  },
		  error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		  }
		});  

	}).then(function(){
		return parse.Object.saveAll(arr1).then(function(resp){ console.log("guardados Entidad 1... " + resp.length); });
	}).then(function(){
		return parse.Object.saveAll(arr2).then(function(resp){ console.log("guardados Entidad 2... " + resp.length); });
	}).then(function(){
		return parse.Object.saveAll(arr3).then(function(resp){ console.log("guardados Entidad 3... " + resp.length); });
	}).then(function(){
		console.log("guardado entre " + skip + "++");
		skip = skip + 500;
	});
	
*/
	
/*  	var Entidad1 = parse.Object.extend("Entidad1");
	var Entidad2 = parse.Object.extend("Entidad2");
	var Entidad3 = parse.Object.extend("Entidad3");
	var qe1 = [];var qe2 = [];var qe3 = [];
	var r1 = []; var r2 = []; var r3 = [];
	for(var i = 9001; i<= 10000; i++){
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
			e1.save().then(function(){
			console.log("guardado: " + e1.get('numero'));
		});	 
	}); 

	res.json(qe1);  */
	
	
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

exports.core_config = function(req, res) {

	if (req.isAuthenticated()) {

		var Core = parse.Object.extend("Core");
		var query = new parse.Query(Core);
		query.find().then(function(results) {
			var coreConfig = {};
			_.each(results, function(config){
				coreConfig[config.get('class')] = config;
			});
			res.json(coreConfig);
		});

	} else {
		res.redirect('/signin');
	}

};

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

exports.class_find_rows = function(req, res) {

	if (req.isAuthenticated()) {
		
	var classname = req.params.classname;
	var promise = new parse.Promise.as();
	promise.then(function(){
		
		var Core = parse.Object.extend("Core");
		var query = new parse.Query(Core);
		query.select("find");
		query.equalTo("class", classname);
		return query.find().then(function(results) {
						console.log(classname);
						var find = {};
						if(results.length > 0){
							find = results[0].get('find');
						}
						return find;
				});
		
	}).then(function(find){
		var parseObject = parse.Object.extend(classname);
		var query = new parse.Query(parseObject);
		if(_.has(req.params, "object_id")){
		   if(req.params.object_id != 'null'){
				query.equalTo("objectId", req.params.object_id);
			}
		}
		query.limit(1000);
		_.each(find.details, function(config){
			if(config.type == 'Pointer'){
				query.include(config.name);
			}
		});
		return query.find().then(function(result){
			var final = [];
			_.each(result, function(row){
				var pass = {};
				pass.objectId = row.id;
				pass.createdAt = row.createdAt;
				pass.updateAt = row.updatedAt;
				_.each(find.details, function(config){
					if(config.type == 'Pointer'){
						if(row.get(config.name) != null){
							pass[config.name] = { className: config.targetClass ,objectId: row.get(config.name).id, value: row.get(config.name).get('name') };
						}
					}else{
						pass[config.name] = row.get(config.name);
					}
				});
				final.push(pass);
			});
			return final;
		});
	}).then(function(final){
		res.json(final);
	});
		


	} else {
		res.redirect('/signin');
	}

};

exports.class_new_row = function(req, res) {

	if (req.isAuthenticated()) {
		
		var clObj = parse.Object.extend(req.body.classname);
		var newRow = new clObj();
		var classData = JSON.parse(req.body.data);
		var classConfig = JSON.parse(req.body.config);

		/*_.each(JSON.parse(req.body.config), function(value, key) {
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
		}); */
		
		_.each(classData, function(value, key){
			var colConfig = _.where(classConfig.find.details, {name: key});
			if(colConfig[0] !== null){
				var type = colConfig[0].type;
				var target = colConfig[0].targetClass;
				
				if(type == 'String' && value !== null){
					newRow.set(key, value);
				} else if (type == 'Date' && value !== null) {
					newRow.set(key, new Date(value));
				} else if (type == 'Pointer' && value !== null) {
					newRow.set(key, {
						"__type": type,
						"className": target,
						"objectId": value
					});
				} else if (type == 'Array' && value !== null) {
					if (value.length > 0) {
						var tempArray = [];
						for (var i = 0; i < value.length; i++) {
							tempArray.push({
								"__type": type,
								"className": target,
								"objectId": value[i]
							});
						}
						newRow.set(key, tempArray);
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
				newRow.set(key, parseFile);
			}
			
		});

		newRow.save().then(function(data) {
			res.json(data);
		}, function(error) {
			res.json(error);
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