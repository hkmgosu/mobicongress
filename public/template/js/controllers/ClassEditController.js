MetronicApp.controller('ClassEditController', function($rootScope, $scope, $http, $timeout, $location, _, $modal, $modalInstance, $log, toaster) {
	// set sidebar closed and body solid layout mode
	$rootScope.settings.layout.pageSidebarClosed = false;

	/////////////////////////////////////////////// BEGIN CREATE FORM

	$scope.className = $rootScope.modalClass;
	$scope.objectId = $rootScope.modalClassObjectId;
	$scope.classConfig = $rootScope.classConfig;
	$scope.getLink = $location.protocol() + '://' + $location.host() + ':' + $location.port() +
		'/api/class_find_rows/' + $scope.className + '/' + $scope.objectId;
	$scope.classUpdateRow = {};
	$scope.classUpdateRow[$scope.className] = {};
	$scope.selectData = {};
	$scope.loadConfigs = {};
	$scope.loadQueries = {};

	console.log($scope.classConfig);

	$http.get($scope.getLink).
	then(function(response) {
		$scope.formData = {};
		$scope.formData[$scope.className] = {};
		$scope.status = response.status;
		$scope.formData[$scope.className].objectId = response.data[0].objectId;
		_.each($rootScope.classConfig[$scope.className].formConfig, function(config) {
			if (config.type == 'Pointer' && _.has(response.data[0], config.name)) {
				$scope.formData[$scope.className][config.name] = response.data[0][config.name].objectId;
			} else if (config.type == 'Array') {
				if (_.has(response.data[0], config.name)) {
					$scope.formData[$scope.className][config.name] = [];
					for (var i = 0; i < response.data[0][config.name].length; i++) {
						$scope.formData[$scope.className][config.name].push(response.data[0][config.name][i].objectId);
					}
				}
			} else {
				$scope.formData[$scope.className][config.name] = response.data[0][config.name];
			}
		});
		return $scope.formData;
	}, function(response) {
		$scope.data = response.data || "Request failed";
		$scope.status = response.status;
	}).then(function(formData) {
		$scope.classUpdateRow[$scope.className].objectId = formData[$scope.className].objectId;
		_.each($rootScope.classConfig[$scope.className].formConfig, function(config) {
			if (config.type == 'Pointer' || config.type == 'Array') {
				var getLink = $location.protocol() + '://' + $location.host() + ':' + $location.port() +
					'/api/class_find_rows/' + config.targetClass + '/null';
				var coreLink = $location.protocol() + '://' + $location.host() + ':' + $location.port() +
					'/api/core_config/';

				if (!(_.has($rootScope.classConfig, config.targetClass))) {
					$rootScope.classConfig[config.targetClass] = null;
					$http.get(coreLink).then(function(response) {
						$rootScope.classConfig[config.targetClass] = response.data[config.targetClass];
						console.log('No existe CONFIG, reload en process...' + config.targetClass);
					});
				}

				$http.get(getLink).then(function(response) {
					$scope.selectData[config.targetClass] = response.data;
					$scope.classUpdateRow[$scope.className][config.name] = formData[$scope.className][config.name];
					console.log('No existe DATA, carga en process...' + config.targetClass);
				});


			} else if (config.type == 'Date') {
				console.log(formData[$scope.className][config.name]);
				$scope.classUpdateRow[$scope.className][config.name] = formData[$scope.className][config.name];
			} else {
				$scope.classUpdateRow[$scope.className][config.name] = formData[$scope.className][config.name];
			}
		});
	});

	/////////////////////////////////////////// END CREATE FORM

	///////////////////////////////////////// BEGIN MODAL FUNCTIONS

	$scope.create = function(className) {

		$rootScope.modalClass = className;

		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'modalNew',
			controller: 'ClassNewController',
			size: ''
		});

		modalInstance.result.then(function(result) {
			console.log(result);
			$http.get($location.protocol() + '://' + $location.host() + ':' + $location.port() +
			'/api/class_find_rows/' + className + '/null').then(function(response) {
				$scope.selectData[className] = response.data;
				console.log(response.data);
				console.log('No existe DATA, carga en process...' + className);
			});
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};

	$scope.ok = function() {
		$modalInstance.close($rootScope.modalClass);
	};

	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
	};

	////////////////////////////////////////// END MODAL FUNCTIONS

	////////////////////////////////////////// BEGIN SAVE NEW CLASS ROW

	$scope.files = {};
	$scope.uploadFile = function(column, files) {
		$scope.files[column] = files[0];
		_.each($scope.files, function(value, key) {
			console.log(key);
			console.log(value);
		});
	};

	$scope.updateClassRow = function(name) {
		$scope.saveDisabled = true;
		console.log($scope.classUpdateRow[name]);
		///// formeteo preguardado

		var fd = new FormData();
		fd.append('classname', name);
		fd.append('config', angular.toJson($rootScope.classConfig[$scope.className]));
		fd.append('data', angular.toJson($scope.classUpdateRow[name]));
		_.each($scope.files, function(value, key) {
			fd.append(key, value);
			console.log('Guardando Files');
			console.log(key);
		});

		//////////////////////////

		$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_update_row', fd, {
			withCredentials: true,
			headers: {
				'Content-Type': undefined
			},
			transformRequest: angular.identity
		}).
		success(function(data, status, headers, config) {
			console.log(data);
			console.log(status);
			toaster.pop(data.type, data.title, data.detail);
			$scope.saveDisabled = false;
		}).
		error(function(data, status, headers, config) {
			console.log(data || "Request failed");
			console.log(status);
			toaster.pop(data.type, data.title, data.detail);
		});

	};

	/////////////////////////////////////////////// END SAVE NEW CLASS ROW

});

/* MetronicApp.factory('getSelectData', function ($http, $q) {
	
	return {
        	getAll:	function getAll(link) {
						var defered = $q.defer();
						var promise = defered.promise;

						$http.get(link)
							.success(function(data) {
								defered.resolve(data);
							})
							.error(function(err) {
								defered.reject(err);
							});

						return promise;
					}
			};

}); */