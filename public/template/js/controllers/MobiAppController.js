MetronicApp.controller('MobiAppController', function($rootScope, $scope, $http, $timeout, toaster) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
		
		$scope.mobiAppLoaded = false;
		$http.get('/api/mobiapps').then(function(response){ 
			$scope.mapps = response.data;
			$scope.mobiAppLoaded = true;
// 			toaster.pop({
// 											type: 'note',
// 											title: 'Cargado',
// 											body: '<h4>apps cargadas exitosamente</h2>',
// 											showCloseButton: true,
// 											bodyOutputType: 'trustedHtml'
// 							});
		});
		
    });
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = false;

});