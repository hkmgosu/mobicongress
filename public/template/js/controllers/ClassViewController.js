MetronicApp.controller('ClassViewController', function($rootScope, $scope, $http, $timeout, $location, $modal, $modalInstance, $log, items, _) {
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = false;
    
    $scope.className = $rootScope.modalClass;
		$scope.objectId = $rootScope.modalClassObjectId;
		$scope.classConfig = $rootScope.classConfig;
		$scope.getLink = $location.protocol() + '://' + $location.host() + ':' + $location.port() + 
						'/api/class_find_rows/' + $scope.className + '/' + $scope.objectId;
    
	$http.get($scope.getLink).
        then(function(response) {
          	$scope.status = response.status;
          	$scope.data = response.data[0];
						console.log($scope.data);
        }, function(response) {
         	$scope.data = response.data || "Request failed";
         	$scope.status = response.status;
      });
	
	$scope.ok = function () {
        $modalInstance.close($rootScope.modalClass);
      };

	$scope.cancel = function () {
        $modalInstance.dismiss('cancel');
	  };
	
	$scope.openView = function(classname, objectId) {

		$rootScope.modalClass = classname;
		$rootScope.modalClassObjectId = objectId;

		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'modalView',
			controller: 'ClassViewController',
			size: '',
			resolve: {
				items: function() {
					return $scope.items;
				}
			}
		});

		modalInstance.result.then(function(result) {
			console.log(result);
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};
	
	$scope.openEdit = function(classname, objectId) {

		$rootScope.modalClass = classname;
		$rootScope.modalClassObjectId = objectId;

		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'modalEdit',
			controller: 'ClassEditController',
			size: '',
			resolve: {
				items: function() {
					return $scope.items;
				}
			}
		});

		modalInstance.result.then(function(result) {
			console.log(result);
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};
	

});