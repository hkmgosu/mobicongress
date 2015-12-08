MetronicApp.controller('ClassController', function($rootScope, $scope, $http, $timeout, $state, $stateParams, $location, $modal, $log, _, uiGridConstants) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        Metronic.initAjax();
		
		$scope.loadGrid();
	
    });
	
	
    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageSidebarClosed = false;
	
	$scope.loadGrid = function(){
		
		$scope.className = $stateParams.classname;
		$scope.disabledOpenNew = true;
		$scope.app_id = $stateParams.app_id;
		$scope.gridOptions = {
													enableFiltering: true,
													enableSorting: true,
													enableColumnResizing: true,
													onRegisterApi: function( gridApi ) {
														$scope.gridApi = gridApi;
													}
												};
		
			$http.get('/api/core_config').then(function(response){ 
				return response.data;
			}).then(function(config){
				$rootScope.classConfig = config;
				return $http.get($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_find_rows/' + $scope.className + '/null').
								success(function(data, status, headers, config) {
								_.each($rootScope.classConfig[$scope.className].uiGridConfig.columnDefs, function(cellConfig){
										if(cellConfig.type == 'Pointer'){
												$scope.gridOptions.columnDefs.push({
														name: cellConfig.name,
														field: cellConfig.field,
														width: cellConfig.width,
														filterCellFiltered: true,
														filter: {
																	'condition': function (searchTerm, cellValue, row, column) {
																									if(cellValue != null){
																										if(cellValue.value.title.match(new RegExp(searchTerm, "gi"))){
																											return row;
																										}
																									}
																								}},
														filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' + 
																									'<input class="form-control" type="text" ng-model="colFilter.term">' +
																									'</div>', 
														cellTemplate:	'<div class="ui-grid-cell-contents" ng-if="COL_FIELD != null">' +
																					'{{COL_FIELD.value.title}}' +
																					'<button type="button" class="btn btn-circle green-haze btn-xs" ng-click="grid.appScope.openView(COL_FIELD.className, COL_FIELD.objectId)"><i class="fa fa-info"></i><span class="hidden-sm hidden-xs"></span></button>' +
																					'</div>'
													});
										}else if(cellConfig.type == 'Date'){
												$scope.gridOptions.columnDefs.push({
														name: cellConfig.name,
														field: cellConfig.field,
														width: cellConfig.width,
														filterCellFiltered: true,
													filter: {
																	'condition': function (searchTerm, cellValue, row, column) {
																									if(cellValue != null){
																										if(new Date(cellValue).getTime() == searchTerm.getTime()){
																											return row;
																										}
																									}
																								}},
														filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' + 
																									'<input class="form-control" type="datetime-local" ng-model="colFilter.term">' +
																									'</div>', 
														cellTemplate:	'<div ng-if="COL_FIELD != null">' +
																					'<div class="ui-grid-cell-contents">' +
																					'{{COL_FIELD | date:"dd-MM-yyyy HH:mm"}}' +
																					'</div>' +
																					'</div>'
								/* 						cellFilter: 'date: "short"',
														filterHeaderTemplate: '<div class="ui-grid-cell-contents"><input class="col-md-" type="datetime-local"></div>' */
												});
										}else if(cellConfig.type == 'File'){
											$scope.gridOptions.columnDefs.push({
												name: cellConfig.name,
												field: cellConfig.field,
												width: cellConfig.width,
												enableHiding: false,
												//enableColumnMenu: false,
												//enableFiltering: false,
												//enableSorting: false,
												filter: {
																	'condition': function (searchTerm, cellValue, row, column) {
																									if(searchTerm === true){
																											return row;
																									}
																								}},
														filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' + 
																									'<label class="checkbox-inline"><input type="checkbox" ng-model="colFilter.term">got file?</label>' +
																									'</div>', 
														cellTemplate:	'<div ng-if="COL_FIELD != null">' +
																					'<div class="ui-grid-cell-contents">' +
																					'<a href="{{COL_FIELD._url}}" class="btn-small btn-info" role="button">{{COL_FIELD._name}}</a>' +
																					'</div>' +
																					'</div>'
											});
										}else{
											$scope.gridOptions.columnDefs.push({
												name: cellConfig.name,
												field: cellConfig.field,
												width: cellConfig.width,
												filterCellFiltered: true,
												filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' + 
																							'<input class="form-control" type="text" ng-model="colFilter.term">' +
																							'</div>', 
												cellTemplate: '<div class="ui-grid-cell-contents">{{COL_FIELD}}</div>'
											});
										}
									});
								$scope.gridOptions.columnDefs.push({
											name: "Options",
											width: "15%",
											enableHiding: false,
											enableColumnMenu: false,
											enableFiltering: false,
											enableSorting: false,
											cellTemplate:	'<div class="ui-grid-cell-contents">' +
															'<button type="button" class="btn btn-circle green-haze btn-xs" ng-click="grid.appScope.openView(grid.appScope.className, row.entity.objectId)"><i class="fa fa-eye"></i><span class="hidden-sm hidden-xs"></span></button>' +
															'<button type="button" class="btn btn-circle green-haze btn-xs" ng-click="grid.appScope.openEdit(grid.appScope.className, row.entity.objectId)"><i class="fa fa-edit"></i><span class="hidden-sm hidden-xs"></span></button>' +
															'</div>'
								});
								$scope.gridOptions.data = data;
								$rootScope.dataLoadStatus = true;
								$scope.disabledOpenNew = false;
							});
				}).then(function(){
					console.log('fully loaded');
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
				classname: $scope.className
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
		
	$scope.items = [];

	$scope.openNew = function(size) {

		$rootScope.modalClass = $stateParams.classname;

		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'modalNew',
			controller: 'ClassNewController',
			size: '',
			resolve: {
				items: function() {
					return $scope.items;
				}
			}
		});

		modalInstance.result.then(function(result) {
			console.log(result);
			// reload grid
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});

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
	
	$scope.reloadRoute = function() {
		$state.reload();
	};
	
	$scope.test = function(){
		console.log('test');
	};

});