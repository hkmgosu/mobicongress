"use strict";

var app = angular.module('mobicongress', ['ngSanitize', 'ui.select', 'ngRoute']);

app.config(function($routeProvider, uiSelectConfig) {

	uiSelectConfig.theme = 'bootstrap';
	uiSelectConfig.resetSearchInput = true;
	uiSelectConfig.appendToBody = true;

	$routeProvider

	// route for the home page
	.when('/', {
		templateUrl: 'views/dashboard/index.html',
		controller: 'HomeController'
	})

	.when('/mobiapps/:mobiapp_id', {
		templateUrl: 'views/dashboard/mobiapp.html',
		controller: 'MobiAppController'
	})

	.when('/class/:classname', {
		templateUrl: 'views/class/class_index.html',
		controller: 'ClassController'
	})

	.when('/class/edit/:object_id', {
		templateUrl: 'views/events/events_edit.html',
		controller: 'EventEditController'
	})

	.otherwise({
		redirectTo: '/'
	});
});

app.filter('capitalize', function() {
	return function(input, scope) {
		if (input != null)
			input = input.toLowerCase();
		return input.substring(0, 1).toUpperCase() + input.substring(1);
	}
});

app.filter('propsFilter', function() {
	return function(items, props) {
		var out = [];

		if (angular.isArray(items)) {
			items.forEach(function(item) {
				var itemMatches = false;

				var keys = Object.keys(props);
				for (var i = 0; i < keys.length; i++) {
					var prop = keys[i];
					var text = props[prop].toLowerCase();
					if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
						itemMatches = true;
						break;
					}
				}

				if (itemMatches) {
					out.push(item);
				}
			});
		} else {
			// Let the output be the input untouched
			out = items;
		}

		return out;
	}
});


app.controller("MainController", ["$scope", "$rootScope", "$location", "$http",
	function($scope, $location, $rootScope, $http) {
		$http.get('/api/getuser').
		success(function(data, status, headers, config) {
			$scope.user = data;
		});

		$rootScope.flash = {
			status: false,
			class: 'success',
			type: 'success!',
			message: 'Bienvenido'
		};

	}
]);

app.controller("HomeController", ["$scope", "$rootScope", "$location", "$http",
	function($scope, $rootScope, $location, $http) {

		$rootScope.title = "Mobicongress | Dashboard";
		$rootScope.page_title = "Parse Apps";
		$rootScope.page_desc = "...";
		$rootScope.active = "dashboard";


		$scope.mapp = {};

		$http.get('/api/mobiapps').
		success(function(data, status, headers, config) {
			$scope.mapps = data;
		});

		if ($location.url() == "/") {
			$rootScope.mini_menu = false;
		}



	}
]);

app.controller("MobiAppController", ["$scope", "$rootScope", "$http", "$routeParams",
	function($scope, $rootScope, $http, $routeParams) {

		$rootScope.title = "Mobicongress | MobiApps";
		$rootScope.page_title = "Classes";
		$rootScope.page_desc = "...";
		$rootScope.active = "MobiApp";
		
		
		$http.get('/api/mobiapps_get/' + $routeParams.mobiapp_id).
		success(function(data, status, headers, config) {
			$scope.schema_classnames = data;

		}).
		error(function(data, status, headers, config) {
			console.log(data || "Request failed");
			console.log(status);
			$rootScope.flash = {
				status: true,
				class: 'danger',
				type: 'ERROR!',
				message: data
			};
		});



		$scope.class_info = [];

		$scope.load_classinfo = function(app_id, js_key, master_key, cname) {

			console.log(cname);

			$http.post('/api/class_find_rows/', {
				applicationId: app_id,
				masterKey: master_key,
				javascriptKey: js_key,
				classname: cname
			}).
			success(function(data, status, headers, config) {
				transform(data);
				console.log(data);
			}).
			error(function(data, status, headers, config) {
				console.log(data || "Request failed");
				console.log(status);
				$rootScope.flash = {
					status: true,
					class: 'danger',
					type: 'ERROR!',
					message: data
				};
			});

			var transform = function(data) {
				$scope.class_info.push(data);
			}
		};


	}
]);

app.controller("ClassController", ["$scope", "$rootScope", "$location", "$http", "$routeParams", '$filter',
	function($scope, $rootScope, $location, $http, $routeParams, $filter) {

		$rootScope.title = "Mobicongress | " + $routeParams.classname;
		$rootScope.page_title = "Class: " + $routeParams.classname;
		$rootScope.page_desc = $routeParams.classname + " de la Aplicación";
		$rootScope.active = $routeParams.classname;

		$scope.classname = $routeParams.classname;

		$http.post('/api/class_find_rows', {
			classname: $routeParams.classname
		}).
		success(function(data, status, headers, config) {
			$scope.class_rows = data;
			$scope.class_config = data.config.web;
		});

		$scope.class_order = {};

		$scope.class_orders = [{
			name: 'title.es',
			column: 'Title'
		}, {
			name: 'start.iso',
			column: 'Start'
		}, {
			name: 'end.iso',
			column: 'End'
		}];

		$scope.item = [];
		$scope.MultiChoices = [];
		$scope.selectChoices = [];
		$scope.selectConfig = [];
		$scope.selectMultipleChoices = [];
		$scope.loadSelect = function(name, type) {

			$http.post('/api/class_find_rows', {
				classname: name
			}).
			success(function(data, status, headers, config) {
				if (type == 'Array') {
					for (var i = 0; i < data.info.length; i++) {
						$scope.selectMultipleChoices.push(data.info[i]);
					}
					$scope.selectConfig[name] = data.config.web.find;
				} else {
					$scope.selectConfig[name] = data.config.web.find;
					$scope.selectChoices[name] = data.info;
				}

			}).
			error(function(data, status, headers, config) {
				console.log(data);
			});



		}

		$scope.class_new_row = [];
		$scope.create_class_row = function(name) {

			$http.post('/api/class_new_row', {
				classname: name,
				info: $scope.class_new_row[name]
			}).
			success(function(data, status, headers, config) {

				console.log(data);

				$rootScope.flash = {
					status: true,
					class: 'success',
					type: 'SUCCESS!',
					message: data
				};

				$scope.class_new_row = [];

				$http.post('/api/class_find_rows', {
					classname: $routeParams.classname
				}).
				success(function(data, status, headers, config) {
					$scope.class_rows = data;
					$scope.class_config = data.config.web;
				});

			}).
			error(function(data, status, headers, config) {
				console.log(data || "Request failed");
				console.log(status);
				$rootScope.flash = {
					status: true,
					class: 'danger',
					type: 'ERROR!',
					message: data
				};
			});


		};


		$scope.delete_class_row = function(id, name) {
			$http.post('/api/class_delete_row', {
				classname: name,
				object_id: id
			}).
			success(function(data, status, headers, config) {
				console.log(data);

				$rootScope.flash = {
					status: true,
					class: 'success',
					type: 'SUCCESS!',
					message: data
				};

				$http.post('/api/class_find_rows', {
					classname: $routeParams.classname
				}).
				success(function(data, status, headers, config) {
					$scope.class_rows = data;
					$scope.class_config = data.config.web;
				});

			}).
			error(function(data, status, headers, config) {
				console.log(data || "Request failed");
				console.log(status);
				$rootScope.flash = {
					status: true,
					class: 'danger',
					type: 'ERROR!',
					message: data
				};
			});
		};



	}
]);


app.controller("EventEditController", ["$scope", "$rootScope", "$http", "$routeParams",
	function($scope, $rootScope, $http, $routeParams) {

		$http.get('/api/events_get/' + $routeParams.event_id).
		success(function(data, status, headers, config) {
			$scope.events_edit = data;
			console.log(data);
			console.log(status);
			//window.location.href = '#/events';
		}).
		error(function(data, status, headers, config) {
			console.log(data || "Request failed");
			console.log(status);
			$rootScope.flash = {
				status: true,
				class: 'danger',
				type: 'ERROR!',
				message: data
			};
		});




		$scope.update_event = function() {

			$http.post('/api/events_update/' + $routeParams.event_id, $scope.events_edit).
			success(function(data, status, headers, config) {
				console.log(data);
				console.log(status);
				$rootScope.flash = {
					status: true,
					class: 'success',
					type: 'SUCCESS!',
					message: data
				};
				window.location.href = '#/events';
			}).
			error(function(data, status, headers, config) {
				console.log(data || "Request failed");
				console.log(status);
				$rootScope.flash = {
					status: true,
					class: 'danger',
					type: 'ERROR!',
					message: data
				};
			});

		};

	}
]);