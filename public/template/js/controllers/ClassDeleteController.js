MetronicApp.controller('ClassDeleteController', function($rootScope, $scope, $http, $timeout, $location, _, $modal, $modalInstance, $log, toaster) {
	// set sidebar closed and body solid layout mode
	$rootScope.settings.layout.pageSidebarClosed = false;

	$scope.className = $rootScope.modalClass;
	$scope.objectId = $rootScope.modalClassObjectId;

	$scope.deleteRow = function(name, id) {
		$scope.borrarDisabled = true;
		$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_delete_row', {
			classname: name,
			object_id: id
		}).
		success(function(data, status, headers, config) {
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

		$scope.ok = function() {
			$modalInstance.close($rootScope.modalClass);
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
		};

	};
});