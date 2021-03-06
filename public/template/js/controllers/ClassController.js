MetronicApp.controller('ClassController', function($rootScope, $scope, $http, $timeout, $state, $stateParams, $location, $modal, $log, _, uiGridConstants, toaster) {
	$scope.$on('$viewContentLoaded', function() {
		// initialize core components
		Metronic.initAjax();

		$scope.className = $stateParams.classname;
		$scope.disabledOpenNew = true;
		$scope.app_id = $stateParams.app_id;
		$scope.gridOptions = {
			enableFiltering: true,
			enableSorting: true,
			enableColumnResizing: true,
			onRegisterApi: function(gridApi) {
				$scope.gridApi = gridApi;
			}
		};

		$scope.loadGrid();

	});


	// set sidebar closed and body solid layout mode
	$rootScope.settings.layout.pageSidebarClosed = false;

	$scope.loadGrid = function() {

		$http.get('/api/core_config').then(function(response) {
			return response.data;
		}, function(fail) {
			console.log('api coreconfig fail');
			console.log(fail);
		}).then(function(config) {
			$rootScope.classConfig = config;
			return $http.get($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/class_find_rows/' + $scope.className + '/null').
			success(function(data, status, headers, config) {
				_.each($rootScope.classConfig[$scope.className].uiGridConfig.columnDefs, function(cellConfig) {
					if (cellConfig.type == 'Array') {
						$scope.gridOptions.columnDefs.push({
							name: cellConfig.name,
							field: cellConfig.field,
							width: cellConfig.width,
							enableFiltering: false,
							cellTemplate: '<div class="ui-grid-cell-contents" ng-if="COL_FIELD != null">' +
								'<a ng-if="COL_FIELD.length > 0" class="btn btn-outline btn-circle btn-xs green-haze" ng-click="grid.appScope.openGrid(grid.appScope.className, col.field, row.entity.objectId, COL_FIELD)"><span class="hidden-sm hidden-xs">{{COL_FIELD.length}}</span></a>' +
								'</div>'
						});
					} else if (cellConfig.type == 'Pointer') {
						$scope.gridOptions.columnDefs.push({
							name: cellConfig.name,
							field: cellConfig.field,
							width: cellConfig.width,
							filterCellFiltered: true,
							filter: {
								'condition': function(searchTerm, cellValue, row, column) {
									if (cellValue != null) {
										if (cellValue.value.title.match(new RegExp(searchTerm, "gi"))) {
											return row;
										}
									}
								}
							},
							filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' +
								'<input class="form-control" type="text" ng-model="colFilter.term">' +
								'</div>',
							cellTemplate: '<div class="ui-grid-cell-contents" ng-if="COL_FIELD != null">' +
								' <a class="btn btn-outline btn-circle btn-xs green-haze" ng-click="grid.appScope.openView(COL_FIELD.className, COL_FIELD.objectId)"><span class="hidden-sm hidden-xs">{{COL_FIELD.value.title}}</span></a>' +
								'</div>'
						});
					} else if (cellConfig.type == 'Date') {
						$scope.gridOptions.columnDefs.push({
							name: cellConfig.name,
							field: cellConfig.field,
							width: cellConfig.width,
							filterCellFiltered: true,
							filter: {
								'condition': function(searchTerm, cellValue, row, column) {
									if (cellValue != null) {
										if (new Date(cellValue).getTime() == searchTerm.getTime()) {
											return row;
										}
									}
								}
							},
							filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' +
								'<input class="form-control" type="datetime-local" ng-model="colFilter.term">' +
								'</div>',
							cellTemplate: '<div ng-if="COL_FIELD != null">' +
								'<div class="ui-grid-cell-contents">' +
								'{{COL_FIELD | date:"dd-MM-yyyy HH:mm"}}' +
								'</div>' +
								'</div>'
								/* 						cellFilter: 'date: "short"',
														filterHeaderTemplate: '<div class="ui-grid-cell-contents"><input class="col-md-" type="datetime-local"></div>' */
						});
					} else if (cellConfig.type == 'File') {
						$scope.gridOptions.columnDefs.push({
							name: cellConfig.name,
							field: cellConfig.field,
							width: cellConfig.width,
							enableHiding: false,
							//enableColumnMenu: false,
							//enableFiltering: false,
							//enableSorting: false,
							filter: {
								'condition': function(searchTerm, cellValue, row, column) {
									if (searchTerm === true) {
										return row;
									}
								}
							},
							filterHeaderTemplate: '<div class="ui-grid-filter-container" ng-repeat="colFilter in col.filters">' +
								'<label class="checkbox-inline"><input type="checkbox" ng-model="colFilter.term">got file?</label>' +
								'</div>',
							cellTemplate: '<div ng-if="COL_FIELD != null">' +
								'<div class="ui-grid-cell-contents">' +
								'<a href="{{COL_FIELD._url}}" class="btn-small btn-info" role="button">{{COL_FIELD._name}}</a>' +
								'</div>' +
								'</div>'
						});
					} else {
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
					cellTemplate: '<div class="ui-grid-cell-contents">' +
						'<button type="button" class="btn btn-circle green-haze btn-xs" ng-click="grid.appScope.openView(grid.appScope.className, row.entity.objectId)"><i class="fa fa-eye"></i><span class="hidden-sm hidden-xs"></span></button>' +
						'<button type="button" class="btn btn-circle green-haze btn-xs" ng-click="grid.appScope.openEdit(grid.appScope.className, row.entity.objectId)"><i class="fa fa-edit"></i><span class="hidden-sm hidden-xs"></span></button>' +
						'<button type="button" class="btn btn-circle green-haze btn-xs" ng-click="grid.appScope.openDelete(grid.appScope.className, row.entity.objectId)"><i class="fa fa-trash-o"></i><span class="hidden-sm hidden-xs"></span></button>' +
						'</div>'
				});
				$scope.gridOptions.data = data;
				$rootScope.dataLoadStatus = true;
				$scope.disabledOpenNew = false;
			}).error(function(data, status) {
				console.error('grid config error', status, data);
			}).finally(function() {
				console.log("grid config loaded");
			})
		}, function(fail) {
			console.log('grid config fail');
			console.log(fail);
		}).then(function() {
			console.log('fully loaded');
			//toaster.pop('success', "Cargado Correctamente", $scope.className + ': ' + $scope.gridOptions.data.length);
		});

	};

	$scope.items = [];

	$scope.openNew = function(size) {

		$rootScope.modalClass = $stateParams.classname;

		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'modalNew',
			controller: 'ClassNewController',
			size: ''
		});

		modalInstance.result.then(function(result) {
			console.log(result);
			// reload grid
		}, function() {
			$scope.loadGrid();
			$scope.gridApi.core.refresh();
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
			size: ''
		});

		modalInstance.result.then(function(result) {
			console.log(result);
			$scope.gridApi.core.refresh();
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
			size: ''
		});

		modalInstance.result.then(function(result) {
			console.log(result);
		}, function() {
			$scope.loadGrid();
			$scope.gridApi.core.refresh();
			$log.info('Modal dismissed at: ' + new Date());
		});

	};

	$scope.openDelete = function(classname, objectId) {

		$rootScope.modalClass = classname;
		$rootScope.modalClassObjectId = objectId;

		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'modalDelete',
			controller: 'ClassDeleteController',
			size: ''
		});

		modalInstance.result.then(function(result) {
			console.log(result);
		}, function() {
			$scope.loadGrid();
			$scope.gridApi.core.refresh();
			$log.info('Modal dismissed at: ' + new Date());
		});

	};

	$scope.openGrid = function(className, columnName, objectId, arrayData) {

		var modalInstance = $modal.open({
			animation: true,
			templateUrl: 'modalGrid',
			controller: 'ClassGridController',
			size: '',
			resolve: {
				parentRowData: function(){
					return { parentRow: { className: className, columnName: columnName, objectId: objectId }, arrayData: arrayData }
				}
			}
		});

		modalInstance.result.then(function(result) {
			console.log(result);
			$scope.gridApi.core.refresh();
		}, function() {
			$log.info('Modal dismissed at: ' + new Date());
		});
	};

});
