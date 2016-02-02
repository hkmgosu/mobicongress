MetronicApp.controller('ClassNewController', function($rootScope, $scope, $http, $timeout, $location, _, $modal, $modalInstance, $log, toaster) {
	// set sidebar closed and body solid layout mode
	$rootScope.settings.layout.pageSidebarClosed = false;

	/////////////////////////////////////////////// BEGIN CREATE FORM

	$scope.className = $rootScope.modalClass;
	$scope.classConfig = $rootScope.classConfig;
	$scope.classNewRow = {};
	$scope.selectData = {};
	$scope.loadConfigs = {};
	$scope.loadQueries = {};

	_.each($rootScope.classConfig[$scope.className].formConfig, function(config) {
		if (config.type == 'Pointer' || config.type == 'Array') {
			var getLink = $location.protocol() + '://' + $location.host() + ':' + $location.port() +
				'/api/class_find_rows/' + config.targetClass + '/null';
			var coreLink = $location.protocol() + '://' + $location.host() + ':' + $location.port() +
				'/api/core_config/';

			if (!(_.has($rootScope.classConfig, config.targetClass))) {
				//$scope.loadConfigs[config.targetClass] = $http.get(coreLink);
				$rootScope.classConfig[config.targetClass] = null;
				$http.get(coreLink).then(function(response) {
					$rootScope.classConfig[config.targetClass] = response.data[config.targetClass];
					console.log('No existe CONFIG, reload en process...' + config.targetClass);
				});
			}


			if (!(_.has($scope.selectData, config.targetClass)) && $rootScope.classConfig[config.targetClass] != null) {
				//$scope.loadQueries[config.targetClass] = $http.get(getLink);
				$scope.selectData[config.targetClass] = null;
				$http.get(getLink).then(function(response) {
					$scope.selectData[config.targetClass] = response.data;
					console.log(response.data);
					console.log('No existe DATA, carga en process...' + config.targetClass);
				});
			}

		}
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
			$scope.selectData[className] = null;
		}, function() {
			$http.get($location.protocol() + '://' + $location.host() + ':' + $location.port() +
			'/api/class_find_rows/' + className + '/null').then(function(response) {
				$scope.selectData[className] = response.data;
				console.log(response.data);
				console.log('No existe DATA, carga en process...' + className);
			});
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

	$scope.createClassRow = function(name) {
		$scope.saveDisabled = true;

		///// formeteo preguardado

		var fd = new FormData();
		fd.append('classname', name);
		fd.append('config', angular.toJson($rootScope.classConfig[$scope.className]));
		fd.append('data', angular.toJson($scope.classNewRow[name]));
		_.each($scope.files, function(value, key) {
			fd.append(key, value);
			console.log('Guardando Files');
			console.log(key);
		});

		//////////////////////////

		$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_new_row', fd, {
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