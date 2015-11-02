MetronicApp.controller('MobiAppController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
		
		$http.get('/api/mobiapps').then(function(response){ 
			$scope.mapps = response.data;
			console.log('mobiapp loaded');
		});
		
    });
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = false;

});