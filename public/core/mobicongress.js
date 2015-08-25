var app = angular.module('mobicongress', ['ngSanitize', 'ui.select', 'ngRoute', 'toaster', 'ngAnimate', 'ui.bootstrap', 'ngFileUpload']);

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

	.when('/class/edit/:classname/:object_id', {
		templateUrl: 'views/class/class_form_edit.html',
		controller: 'ClassEditController'
	})

	.otherwise({
		redirectTo: '/'
	});
});

app.factory('_', function() {
	return window._; // assumes underscore has already been loaded on the page
});

app.filter('capitalize', function() {
	return function(input, scope) {
		if (input !== null)
			input = input.toLowerCase();
		return input.substring(0, 1).toUpperCase() + input.substring(1);
	};
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

app.directive('fileUpload', function() {
	return {
		scope: true, //create a new scope
		link: function(scope, el, attrs) {
			el.bind('change', function(event) {
				var files = event.target.files;
				//iterate files since 'multiple' may be specified on the element
				for (var i = 0; i < files.length; i++) {
					//emit event upward
					scope.$emit("fileSelected", {
						file: files[i]
					});
				}
			});
		}
	};
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

		console.log($location.absUrl());

	}
]);

app.controller("MobiAppController", ["$scope", "$rootScope", "$http", "$routeParams", "$location",
	function($scope, $rootScope, $http, $routeParams, $location) {

		$rootScope.title = "Mobicongress | MobiApps";
		$rootScope.page_title = "Classes";
		$rootScope.page_desc = "...";
		$rootScope.active = "MobiApp";
		$scope.schema_data = [];
		$scope.hide_contain = true;
		$scope.loading = 0;

		console.log($location.protocol());

		$http.get('/api/mobiapps_get/' + $routeParams.mobiapp_id).then(function(result) {
			//console.log(result);
			return result.data;
		}).then(function(result) {

			var total = result.classes.length;
			var i = 0;

			_.each(result.classes, function(value, key) {
				$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_find_rows/', {
					applicationId: result.applicationId,
					masterKey: result.masterKey,
					javascriptKey: result.javascriptKey,
					classname: value.className
				}).then(function(result) {
					$scope.schema_data.push(result.data);
					i++;
					$scope.loading = (i * 100) / total;
					if (i == total) $scope.hide_contain = false;
				});
			});

		});

	}
]);

app.controller("ClassController", ["$scope", "$rootScope", "$location", "$http", "$routeParams", '$filter', '_', 'toaster', '$modal', '$log', 'Upload',
	function($scope, $rootScope, $location, $http, $routeParams, $filter, _, toaster, $modal, $log, Upload) {

		$rootScope.title = "Mobicongress | " + $routeParams.classname;
		$rootScope.page_title = "Class: " + $routeParams.classname;
		$rootScope.page_desc = $routeParams.classname + " de la Aplicación";
		$rootScope.active = $routeParams.classname;
		$scope.classname = $routeParams.classname;

		$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_find_rows', {
			classname: $routeParams.classname
		}).
		success(function(data, status, headers, config) {
			$scope.class_rows = data;
			$scope.class_config = data.config;
		});

		$scope.selectChoices = [];
		$scope.loadSelect = function(name, include) {

			$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_find_rows', {
				classname: name,
				includes: include
			}).
			success(function(data, status, headers, config) {

				$scope.selectChoices[name] = [];
				for (var i = 0; i < data.classdata.length; i++) {
					if (include.length > 0) {
						for (var j = 0; j < include.length; j++) {
							if (include[j] == data.classdata[i].includes[j].classname) {
								data.classdata[i].classdata[include[j]] = data.classdata[i].includes[j].classdata;
								delete data.classdata[i].includes;
								$scope.selectChoices[name].push(data.classdata[i].classdata);
							}
						}
					} else {
						$scope.selectChoices[name].push(data.classdata[i].classdata);
					}
				}


			}).
			error(function(data, status, headers, config) {
				console.log(data);
			});
		};

		$scope.class_new_row = [];
		$scope.create_class_row = function(name) {
			$scope.guardarDisabled = true;
			var fd = new FormData();
			_.each($scope.files, function(value, key) {
				fd.append(key, value);
				console.log(key);
			});
			fd.append('classname', name);
			fd.append('info', angular.toJson($scope.class_new_row[name]));

			$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_new_row', fd, {
				withCredentials: true,
				headers: {
					'Content-Type': undefined
				},
				transformRequest: angular.identity
			}).
			success(function(data, status, headers, config) {
				console.log(data || "Request failed");
				console.log(status);
				$scope.guardarDisabled = false;
				toaster.pop(data.type, data.title, data.detail);


				$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_find_rows', {
					classname: $routeParams.classname
				}).
				success(function(data, status, headers, config) {
					$scope.class_rows = data;
					$scope.class_config = data.config;
				});

			}).
			error(function(data, status, headers, config) {
				console.log(data || "Request failed");
				console.log(status);
				toaster.pop(data.type, data.title, data.detail);
			});

		};

		$scope.files = {};
		$scope.uploadFile = function(column, files) {
			//fd.append(column, files[0]);
			//console.log(files[0]);
			$scope.files[column] = files[0];
			_.each($scope.files, function(value, key) {
				console.log(key);
				console.log(value);
			});

		};


		$scope.delete_class_row = function(id, name) {
			$scope.borrarDisabled = true;
			$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_delete_row', {
				classname: name,
				object_id: id
			}).
			success(function(data, status, headers, config) {

				$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_find_rows', {
					classname: $routeParams.classname
				}).
				success(function(data, status, headers, config) {
					$scope.class_rows = data;
					$scope.class_config = data.config;
				});

				console.log(data);
				console.log(status);
				toaster.pop(data.type, data.title, data.detail);
				$scope.borrarDisabled = false;
			}).
			error(function(data, status, headers, config) {
				console.log(data || "Request failed");
				console.log(status);
				toaster.pop(data.type, data.title, data.detail);
			});
		};




		


		$scope.items = ['item1', 'item2', 'item3'];

		$scope.open = function(size) {

			var modalInstance = $modal.open({
				animation: true,
				templateUrl: 'myModalContent.html',
				controller: 'ModalInstanceCtrl',
				size: size,
				resolve: {
					items: function() {
						return $scope.items;
					}
				}
			});

			modalInstance.result.then(function(selectedItem) {
				$scope.selected = selectedItem;
			}, function() {
				$log.info('Modal dismissed at: ' + new Date());
			});
		};




	}
]);

app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});


app.controller("ClassEditController", ["$scope", "$rootScope", "$location", "$http", "$routeParams", '$filter', '_', 'toaster', 'Upload',
	function($scope, $rootScope, $location, $http, $routeParams, $filter, _, toaster, Upload) {

		$rootScope.title = "Mobicongress | " + $routeParams.classname;
		$rootScope.page_title = "Class: " + $routeParams.classname;
		$rootScope.page_desc = $routeParams.classname + " de la Aplicación";
		$rootScope.active = $routeParams.classname;
		$scope.classname = $routeParams.classname;

		$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_find_rows', {
			classname: $routeParams.classname,
			object_id: $routeParams.object_id
		}).
		success(function(data, status, headers, config) {

			$scope.class_config = data.config;
			$scope.class_edit_row = {};
			console.log(data);

			$scope.class_edit_row.objectId = data.classdata[0].objectId;
			_.each(data.config.update, function(value, key) {
				if (data.classdata[0][value.name] !== undefined) {
					if (value.type == 'String' && value.inputType == 'text' || value.inputType == 'textarea') {
						$scope.class_edit_row[value.name] = data.classdata[0][value.name];
					} else if (value.type == 'Date' && value.inputType == 'datetime-local') {
						$scope.class_edit_row[value.name] = new Date(data.classdata[0][value.name].iso);
					} else if (value.type == 'Pointer' && value.inputType == 'select') {
						$scope.class_edit_row[value.name] = data.classdata[0][value.name].objectId;
					} else if (value.type == 'Array' && value.inputType == 'select') {
						var paso = [];
						for (var i = 0; i < data.classdata[0][value.name].length; i++) {
							paso.push(data.classdata[0][value.name][i].objectId);
						}
						$scope.class_edit_row[value.name] = paso;
					} else {
						$scope.class_edit_row[value.name] = data.classdata[0][value.name];
					}
				} else {
					/* 						console.log(value.name);
						console.log(value); */
				}
			});

			console.log($scope.class_edit_row);

		});


		$scope.selectChoices = [];
		$scope.loadSelect = function(name, include) {

			$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_find_rows', {
				classname: name,
				includes: include
			}).
			success(function(data, status, headers, config) {

				$scope.selectChoices[name] = [];
				for (var i = 0; i < data.classdata.length; i++) {
					if (include.length > 0) {
						for (var j = 0; j < include.length; j++) {
							if (include[j] == data.classdata[i].includes[j].classname) {
								data.classdata[i].classdata[include[j]] = data.classdata[i].includes[j].classdata;
								delete data.classdata[i].includes;
								$scope.selectChoices[name].push(data.classdata[i].classdata);
							}
						}
					} else {
						$scope.selectChoices[name].push(data.classdata[i].classdata);
					}
				}


			}).
			error(function(data, status, headers, config) {
				console.log(data);
			});
		};

		$scope.class_new_row = [];
		$scope.save_class_row = function(name) {

			$scope.guardarDisabled = true;
			console.log($scope.class_new_row[name]);
			console.log(name);
			var fd = new FormData();
			_.each($scope.files, function(value, key) {
				fd.append(key, value);
				console.log(key);
			});
			fd.append('classname', name);
			fd.append('info', angular.toJson($scope.class_new_row[name]));

			$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_update_row', fd, {
				withCredentials: true,
				headers: {
					'Content-Type': undefined
				},
				transformRequest: angular.identity
			}).
			success(function(data, status, headers, config) {
				console.log(data || "Request failed");
				console.log(status);
				$scope.guardarDisabled = false;
				$location.path("/class/" + $scope.classname);
				toaster.pop(data.type, data.title, data.detail);




			}).
			error(function(data, status, headers, config) {
				console.log(data || "Request failed");
				console.log(status);
				toaster.pop(data.type, data.title, data.detail);
			});

		};

		$scope.files = [];
		$scope.uploadFile = function(column, files) {
			//fd.append(column, files[0]);
			//console.log(files[0]);
			$scope.files[column] = files[0];
			_.each($scope.files, function(value, key) {
				console.log(key);
				console.log(value);
			});
		};


	}
]);