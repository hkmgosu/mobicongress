MetronicApp.controller('MobiAppClassController', function($rootScope, $scope, $http, $timeout, $stateParams) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
		$http.get('/api/mobiapps_get/' + $stateParams.app_id).then(function(response) {
			console.log('mobiapp class loaded');
			console.log(response.data);
			$scope.schema_data = response.data;
			$scope.app_id = $stateParams.app_id;
		});
		
    });
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = false;

});