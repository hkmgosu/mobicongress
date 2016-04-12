var config = require('../config/config');
var parse = require('parse/node').Parse;
var passport = require('passport');
var _ = require('underscore');
var fs = require('fs');
var url = require('url');
var request = require('request');

exports.create_class_config = function(req, res) {
	var appName = req.params.apna;
	var className = req.params.clna;
	var formConfig = [],
			rowConfig = [];
		var uiGridConfig = {},
			uiSelectConfig = {};

	var formatFormConfig = function(name, info) {
		//console.log('formating column: ' + name + ', type: ' + info.type);
		if(name != "objectId" && name != "createdAt" && name != "updatedAt") {
				if (info.type == 'String') {
					return {
						"inputType": "text",
						"name": name,
						"type": info.type
					}
				}
				if (info.type == 'Date') {
					return {
						"inputType": "datetime-local",
						"name": name,
						"type": info.type
					}
				}
				if (info.type == 'Pointer') {
					return {
						"inputType": "select",
						"name": name,
						"targetClass": info.targetClass,
						"type": info.type
					}
				}
				if (info.type == 'Array') {
					return {
						"inputType": "select",
						"name": name,
						"targetClass": info.targetClass,
						"type": info.type
					}
				}
				if (info.type == 'Number') {
					return {
						"inputType": "number",
						"name": name,
						"type": info.type
					}
				}
		}
	};

	var formatRowConfig = function(name, info) {
			if(name != "objectId" && name != "createdAt" && name != "updatedAt") {
					if (info.type == 'Pointer') {
				return {
					"columns": {
						"subTitle": [
							[
								name
							]
						],
						"title": [
							[
								name
							]
						]
					},
					"includes": [
						name
					],
					"name": name,
					"targetClass": info.targetClass,
					"type": info.type
				}
			} else
					if (info.type == 'Array') {
				return {
			"columns": {
				"subTitle": [
					[

					]
				],
				"title": [
					[

					]
				]
			},
			"includes": [
				name
			],
			"name": name,
			"targetClass": info.targetClass,
			"type": info.type
		}
			} else {
							return {
					"name": name,
					"type": info.type
				};
					}
			}
	};
	
	var checkClassConfig = function(appInfo){
		
			console.log('verificando class exist: ' + className);
			parse.initialize(appInfo.applicationId, appInfo.javascriptKey, appInfo.masterKey);
		
			var Core = parse.Object.extend("Core");
			var query = new parse.Query(Core);
			query.equalTo('class', className);
			query.find().then(function(response) {
				var newConfig;
				if(response.length > 0){
						newConfig = response[0];
				}else{
					Core = parse.Object.extend("Core");
					newConfig = new Core();
				}
				newConfig.set('class', className);
				newConfig.set('formConfig', formConfig);
				newConfig.set('rowConfig', rowConfig);
				newConfig.set('active', false);
				newConfig.save().then(
					function(data) {
						res.json({
							type: 'success',
							title: 'SUCCESS!',
							detail: className + ' configuración guardada exitosamente'
						});
					},
					function(error) {
						res.json({
							type: 'error',
							title: 'ERROR! no se ha guardado el objeto ' + className,
							detail: "Error: " + error.code + " " + error.message
						});
					}
				);
			}, function(error) { res.json(error)});
	};

	var createCoreConfig = function(classSchema, appInfo) {
		_.each(classSchema.fields, function(colInfo, colName) {
			var colFormConfig = formatFormConfig(colName, colInfo);
			var colRowConfig = formatRowConfig(colName, colInfo);
			if (colFormConfig != null) formConfig.push(colFormConfig);
			if (colRowConfig != null) rowConfig.push(colRowConfig);
		});
		
		checkClassConfig(appInfo)
	};

	var getAppSchema = function(appInfo) {

		console.log('getAppSchema begins');

		var parseUrl = "https://api.parse.com/1/schemas";
		var parseHeaders = {
			"X-Parse-Application-Id": appInfo.applicationId,
			"X-Parse-Master-Key": appInfo.masterKey,
			"Content-Type": "application/json"
		};
		var parseGet = {
			url: parseUrl,
			headers: parseHeaders
		};
		var jsonString = '';

		request
			.get(parseGet)
			.on('response', function(response) {
				if (response.statusCode == 200) {
					console.log('Schema Get Success');
				} else {
					console.log(response.statusCode);
					console.log('schema fail request');
					res.json(response);
				}
			})
			.on('data', function(data) {
				jsonString += data;
			})
			.on('end', function() {
				createCoreConfig(_.where(JSON.parse(jsonString).results, {
					className: className
				})[0], appInfo);
			})
			.on('error', function(error) {
				console.log(error);
				res.end();
			});

	};

	var parseUrl = "https://api.parse.com/1/apps";
	var parseHeaders = {
		"X-Parse-Email": config.PARSE_ACCOUNT_USER,
		"X-Parse-Password": config.PARSE_ACCOUNT_PASSWORD,
		"Content-Type": "application/json"
	};
	var parseGet = {
		url: parseUrl,
		headers: parseHeaders
	};
	var jsonString = '';
	var schema = {};


	request.get(parseGet)
		.on('response', function(response) {
			if (response.statusCode == 200) {
				console.log('Apps Info Get Success');
			} else {
				console.log(response.statusCode);
			}
		})
		.on('data', function(data) {
			jsonString += data;
		})
		.on('end', function() {
			getAppSchema(_.where(JSON.parse(jsonString).results, {
				appName: req.params.apna
			})[0]);
		})
		.on('error', function(error) {
			console.log(error);
			res.end();
		});


};

exports.core_config = function(req, res) {

	if (req.isAuthenticated()) {

		var Core = parse.Object.extend("Core");
		var query = new parse.Query(Core);
		query.equalTo('active', true);
		query.find().then(function(results) {
			var coreConfig = {};
			_.each(results, function(config) {
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

		var parseUrl = "https://api.parse.com/1/apps";
		var parseHeaders = {
			"X-Parse-Email": config.PARSE_ACCOUNT_USER,
			"X-Parse-Password": config.PARSE_ACCOUNT_PASSWORD,
			"Content-Type": "application/json"
		};
		var parseGet = {
			url: parseUrl,
			headers: parseHeaders
		};
		var jsonString = '';

		request
			.get(parseGet)
			.on('response', function(response) {
				if (response.statusCode == 200) {
					console.log('Schema Get Success');
				} else {
					console.log(response.statusCode);
				}
			})
			.on('data', function(data) {
				jsonString += data;
			})
			.on('end', function() {
				res.json(JSON.parse(jsonString).results);
			})
			.on('error', function(error) {
				console.log(error);
				res.end();
			});


	} else {
		res.redirect('/signin');
	}

};

exports.mobiapps_get = function(req, res) {

	if (req.isAuthenticated()) {

		var formatParseApp = function(mapp) {
			parse.initialize(mapp.applicationId, mapp.javascriptKey, mapp.masterKey);
			var Core = parse.Object.extend("Core");
			var query = new parse.Query(Core);
			query.equalTo('active', true);
			var total = [];
			query.find().then(function(results) {
				console.log("configuraciones encontradas: " + results.length);
				var loop = [];
				_.each(results, function(result) {
					var object = result;
					var classname = object.get('class');
					var clobj = parse.Object.extend(classname);
					var query = new parse.Query(clobj);
					loop.push(query);
				});
				return (loop);
			}).then(function(querys) {
				var promise1 = parse.Promise.as();
				_.each(querys, function(value) {
					promise1 = promise1.then(function() {
						console.log('queries guardadas, guardando el resultado---: ' + value.className);
						return value.count({
							success: function(num) {
								console.log({
									classname: value.className,
									total: num
								});
								total.push({
									classname: value.className,
									total: num
								});
							},
							error: function(error) {
								console.log(error);
							}
						});
					});
				});
				return promise1;
			}).then(function() {
				res.json(total);
			});
		};

		var parseUrl = "https://api.parse.com/1/apps/" + req.params.mobiapp_id;
		var parseHeaders = {
			"X-Parse-Email": config.PARSE_ACCOUNT_USER,
			"X-Parse-Password": config.PARSE_ACCOUNT_PASSWORD,
			"Content-Type": "application/json"
		};
		var parseGet = {
			url: parseUrl,
			headers: parseHeaders
		};
		var jsonString = '';

		request
			.get(parseGet)
			.on('response', function(response) {
				if (response.statusCode == 200) {
					console.log('Schema Get Success');
				} else {
					console.log(response.statusCode);
				}
			})
			.on('data', function(data) {
				jsonString += data;
			})
			.on('end', function() {
				console.log(jsonString);
				formatParseApp(JSON.parse(jsonString));
			})
			.on('error', function(error) {
				console.log(error);
				res.end();
			});


	} else {
		res.json('/signin');
	}

};

exports.class_find_rows = function(req, res) {

	var hasObjectId = false;
	if (_.has(req.params, "object_id") && req.params.object_id != 'null') {
		hasObjectId = true;
	}
	var classname = req.params.classname;
	var promise = new parse.Promise.as();

	promise.then(function() {
		var Core = parse.Object.extend("Core");
		var query = new parse.Query(Core);
		query.equalTo("class", classname);
		return query.find().then(function(results) {
			return {
				rowConfig: results[0].get('rowConfig')
			};
		});
	}).then(function(classConfig) {
		var parseObject = parse.Object.extend(classname);
		var query = new parse.Query(parseObject);
		if (hasObjectId) {
			query.equalTo("objectId", req.params.object_id);
		}
		_.each(classConfig.rowConfig, function(config) {
			if (config.type == 'Pointer' || config.type == 'Array') {
				_.each(config.includes, function(include) {
					query.include(include);
				});
			}
		});
		query.limit(1000);
		return query.find().then(function(result) {
			var final = [];
			_.each(result, function(row) {
				var pass = {};
				pass.objectId = row.id;
				pass.createdAt = row.createdAt;
				pass.updateAt = row.updatedAt;
				_.each(classConfig.rowConfig, function(config) {
					if (config.type == 'Pointer') {
						if (row.get(config.name)) {
							var titleString = '';
							var subTitleString = '';
							_.each(config.columns.title, function(title) {
								var temp = row;
								_.each(title, function(col) {
									if (temp) {
										temp = temp.get(col);
									}
								});
								titleString = titleString + temp + ' ';
							});
							_.each(config.columns.subTitle, function(subTitle) {
								var temp = row;
								_.each(subTitle, function(col) {
									if (temp) {
										temp = temp.get(col);
									}
								});
								subTitleString = subTitleString + temp + ' ';
							});
							pass[config.name] = {
								className: config.targetClass,
								objectId: row.get(config.name).id,
								value: {
									title: titleString,
									subTitle: subTitleString
								}
							};
						}
					} else if (config.type == 'Array') {
						pass[config.name] = [];
						if (row.get(config.name)) {
							_.each(row.get(config.name), function(arrayRow) {
								console.log('controlando: ' + row.id);
								if (arrayRow) {
									var titleString = '';
									var subTitleString = '';
									var temp = null;
									_.each(config.columns.title, function(title) {
										temp = arrayRow;
										_.each(title, function(col) {
											//console.log('columna Array titulo: ' + col);
											if (temp) {
												temp = temp.get(col);
											}
										});
										titleString = titleString + temp + ' ';
									});
									_.each(config.columns.subTitle, function(subTitle) {
										temp = arrayRow;
										_.each(subTitle, function(col) {
											console.log("columna Array subtitulo: " + col);
											if (temp) {
												temp = temp.get(col);
											}
										});
										subTitleString = subTitleString + temp + ' ';
									});
									pass[config.name].push({
										className: config.targetClass,
										objectId: arrayRow.id,
										value: {
											title: titleString,
											subTitle: subTitleString
										}
									});
								}
							});
						}



					} else {
						pass[config.name] = row.get(config.name);
					}
				});
				final.push(pass);
			});
			return final;
		});
	}).then(function(final) {
		res.json(final);
	});

};

exports.class_new_row = function(req, res) {

	if (req.isAuthenticated()) {

		var clObj = parse.Object.extend(req.body.classname);
		var newRow = new clObj();
		var classData = JSON.parse(req.body.data);
		var classConfig = JSON.parse(req.body.config);
		console.log(classData);
		_.each(classData, function(value, key) {
			var colConfig = _.where(classConfig.rowConfig, {
				name: key
			});
			if (colConfig[0] !== null) {
				if (colConfig[0].type == 'String' && value !== null) {
					newRow.set(key, value);
				} else if (colConfig[0].type == 'Date' && value !== null) {
					newRow.set(key, new Date(value));
				} else if (colConfig[0].type == 'Pointer' && value !== null) {
					newRow.set(key, {
						"__type": "Pointer",
						"className": colConfig[0].targetClass,
						"objectId": value
					});
				} else if (colConfig[0].type == 'Array' && value !== null) {
					if (value.length > 0) {
						var tempArray = [];
						for (var i = 0; i < value.length; i++) {
							tempArray.push({
								"__type": "Pointer",
								"className": colConfig[0].targetClass,
								"objectId": value[i]
							});
						}
						newRow.set(key, tempArray);
					}
				} else if (value != null) {
					newRow.set(key, value);
				}

			}
		});

		_.each(req.files, function(value, key) {
			console.log(req.files);
			console.log(value.path);
			if (value.path !== undefined) {
				var fileData = fs.readFileSync(value.path);
				fileData = Array.prototype.slice.call(new Buffer(fileData), 0);
				var parseFile = new parse.File(value.name, fileData);
				newRow.set(key, parseFile);
			}

		});

		newRow.save().then(function(data) {
			res.json({
				type: 'success',
				title: 'SUCCESS!',
				detail: req.body.classname + ' guardado exitosamente'
			});
		}, function(error) {
			res.json({
				type: 'error',
				title: 'ERROR! no se ha guardado el objeto ' + req.body.classname,
				detail: "Error: " + error.code + " " + error.message
			});
		});


	} else {
		res.json('/signin');
	}

};

exports.class_update_row = function(req, res) {

	if (req.isAuthenticated()) {
		var Clobj = parse.Object.extend(req.body.classname);
		var query = new parse.Query(Clobj);
		var classData = JSON.parse(req.body.data);
		var classConfig = JSON.parse(req.body.config);

		query.get(classData.objectId, {
			success: function(classup) {
				classup.save(null, {
					success: function(updateRow) {

						_.each(classData, function(value, key) {
							if (key != 'objectId') {
								var colConfig = _.where(classConfig.rowConfig, {
									name: key
								});
								if (colConfig[0] !== null) {
									if (colConfig[0].type == 'String' && value !== null) {
										updateRow.set(key, value);
									} else if (colConfig[0].type == 'Date' && value !== null) {
										updateRow.set(key, new Date(value));
									} else if (colConfig[0].type == 'Pointer' && value !== null) {
										updateRow.set(key, {
											"__type": 'Pointer',
											"className": colConfig[0].targetClass,
											"objectId": value
										});
									} else if (colConfig[0].type == 'Array' && value !== null) {
										if (value.length > 0) {
											var tempArray = [];
											for (var i = 0; i < value.length; i++) {
												tempArray.push({
													"__type": 'Pointer',
													"className": colConfig[0].targetClass,
													"objectId": value[i]
												});
											}
											updateRow.set(key, tempArray);
										}
									}

								}
							}
						});

						_.each(req.files, function(value, key) {
							console.log(req.files);
							console.log(value.path);
							if (value.path !== undefined) {
								var fileData = fs.readFileSync(value.path);
								fileData = Array.prototype.slice.call(new Buffer(fileData), 0);
								var parseFile = new parse.File(value.name, fileData);
								updateRow.set(key, parseFile);
							}

						});

						updateRow.save().then(function(data) {
							res.json({
								type: 'success',
								title: 'SUCCESS!',
								detail: req.body.classname + ' guardado exitosamente'
							});
						}, function(error) {
							res.json({
								type: 'error',
								title: 'ERROR! no se ha guardado el objeto ' + req.body.classname,
								detail: "Error: " + error.code + " " + error.message
							});
						});







					}
				});

			},
			error: function(data, error) {
				res.json({
					type: 'error',
					title: 'ERROR! no se ha guardado el objeto ' + req.body.classname,
					detail: "Error: " + error.code + " " + error.message
				});
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
				res.json({
					type: 'success',
					title: 'Success!',
					detail: 'Deleted ' + req.body.classname
				});
			},
			error: function(data, error) {
				res.json({
					type: 'error',
					title: 'ERROR! no se borrado el objeto ' + req.body.classname,
					detail: "Error: " + error.code + " " + error.message
				});
			}
		});

	} else {
		res.json('/signin');
	}

};

exports.class_update_array_col = function(req, res) {

	if (req.isAuthenticated()) {
		var className = req.body.clname;
		var colName = req.body.colname;
		var parentId = req.body.id;
		var clObj = parse.Object.extend(className);
		var query = new parse.Query(clObj);
		var arrayData = req.body.arrdata;
		var parseArray = [];

		_.each(arrayData, function(item) {
			parseArray.push({
				"__type": 'Pointer',
				"className": item.className,
				"objectId": item.objectId
			});
		});

		query.get(parentId, {
			success: function(row) {
				row.set(colName, parseArray);
				row.save().then(function(data) {
					res.json({
						type: 'success',
						title: 'SUCCESS!',
						detail: className + ' guardado exitosamente'
					});
				}, function(error) {
					res.json({
						type: 'error',
						title: 'ERROR! no se ha guardado el objeto ' + className,
						detail: "Error: " + error.code + " " + error.message
					});
				});
			},
			error: function(data, error) {
				res.json({
					type: 'error',
					title: 'ERROR! no se ha Actualizado el campo (Error Server).' + req.body.classname,
					detail: "Error: " + error.code + " " + error.message
				});
			}
		});

	} else {
		res.json('/signin');
	}
};

exports.class_get_array_formated = function(req, res) {

	console.log(req.params);

	var hasClassName = false,
		hasObjectId = false,
		hasColumnName = false;
	if (_.has(req.params, "clna") && req.params.object_id != 'clna') hasClassName = true;
	if (_.has(req.params, "obid") && req.params.object_id != 'obid') hasObjectId = true;
	if (_.has(req.params, "cona") && req.params.object_id != 'cona') hasColumnName = true;

	if (hasClassName) {

		var className = req.params.clna;
		var colName = req.params.cona;
		var parentId = req.params.obid;
		var classConfig = {};

		var Core = parse.Object.extend("Core");
		var query = new parse.Query(Core);
		query.equalTo('active', true);
		query.find().then(
			function(results) {
				var paCo = {};
				_.each(results, function(clCo){
					if(clCo.get('class') == className){
							paCo = _.findWhere(clCo.get('rowConfig'), {name: colName});
					}
				});
				
				if (paCo !== undefined) {
					console.log(paCo);
						_.each(results, function(clCo){
							if(clCo.get('class') == paCo.targetClass){
									classConfig.uiSelectConfig = clCo.get('uiSelectConfig');
									classConfig.targetClass = paCo.targetClass;
							}
						});
						console.log(classConfig);
						return classConfig;
				}
				else res.json('config load fail');
			},
			function(error) {
				res.json({
					type: 'error',
					title: 'ERROR! no se ha cargado config: ' + className + ' - ' + colName,
					detail: "Error: " + error.code + " " + error.message
				});
			}
		).then(function(clco) {
			if(clco !== {}){
			var clObj = parse.Object.extend(clco.targetClass);
			query = new parse.Query(clObj);
			query.find().then(
				function(results) {
					var formated = [];
					_.each(results, function(row) {
						var title = [],
							subTitle = [];
						_.each(clco.uiSelectConfig.title, function(tc) {
							title.push(row.get(tc.field));
						});
						_.each(clco.uiSelectConfig.subTitle, function(stc) {
							subTitle.push(row.get(stc.field));
						});

						formated.push({
							className: clco.targetClass,
							objectId: row.id,
							value: {
								title: title.join(' '),
								subTitle: subTitle.join(' ')
							}
						});

					});
					res.json(formated);
				},
				function(error) {}
			);
		}else{
			res.json({});
		}
		});

	} else {
		res.json({
			type: 'error',
			title: 'parametros invalidos',
			detail: "Error: " + error.code + " " + error.message
		});
	}

};

exports.prueba = function(req, res) {

	var parseUrl = "https://www.parse.com/1/classes/Core";
	var parseHeaders = {
		"X-Parse-Application-Id": "a96tn47pbH5wTAVUSH0zid1hL4Auk35MF3hVgDGj",
		"X-Parse-REST-API-Key": "RjkVE39qmlPDGsf4dT8zcYbBEJrPco1jQYH0wxug",
		"Content-Type": "application/json"
	};
	var parseGet = {
		url: parseUrl,
		headers: parseHeaders
	};
	var jsonString = '';

	request
		.get(parseGet)
		.on('response', function(response) {
			if (response.statusCode == 200) {
				console.log('Schema Get Success');
			} else {
				console.log(response.statusCode);
			}
		})
		.on('data', function(data) {
			jsonString += data;
		})
		.on('end', function() {
			res.json(JSON.parse(jsonString).results);
		})
		.on('error', function(error) {
			console.log(error);
			res.end();
		});



};

exports.pruebaOld = function(req, res) {

	// 	parse.initialize();
	// 	var parseObj = parse.Object.extend("Event");
	// 	var query = new parse.Query(parseObj);
	// 	query.include('place');
	// 	query.limit(1);
	// 	query.find().then(function(response){
	// 			res.render('test', { value: response });
	// 	});

	/*var classname = req.body.classname;
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