MetronicApp.controller('ClassGridController', function($rootScope, $scope, $http, $timeout, $location, $modal, $modalInstance, $log, _, toaster, parentRowData) {

	// set sidebar closed and body solid layout mode
	$rootScope.settings.layout.pageSidebarClosed = false;

	$scope.className = parentRowData.parentRow.className;
	$scope.columnName = parentRowData.parentRow.columnName;
	$scope.objectId = parentRowData.parentRow.objectId;
	$scope.gridRows = parentRowData.arrayData;
	$rootScope.dataLoadStatus = true;
	$scope.removeButtonDisabled = {};
	$scope.addButtonDisabled = true;
	$scope.removeSelectItemDisabled = true;
	$scope.selectDisabled = true;
	$scope.selectData = [];
	$scope.selectedItem = {};

	
	// logic

	$scope.load = function(){
		$http.get($location.protocol() + '://' + $location.host() + ':' + $location.port() +
			'/api/clgearfo/' + $scope.className + '/' + $scope.objectId + '/' + $scope.columnName).then(function(response) {
				var result = response.data;
			 	$scope.selectData = result;
				$scope.selectDisabled = false;
				$scope.checkingItems($scope.selectData, $scope.gridRows);
			  $scope.checkingButtons();
				console.log("filas resultado: " + $scope.selectData.length);
				console.log('No existe DATA, carga en process...' + $scope.className);
			}, function(error){
			console.log(error);
		});

	};

	$scope.addItem = function(item){
		var index = $scope.gridRows.indexOf(item);
		$scope.gridRows.push(item);
		var arrdata = $scope.gridRows;
		console.log(arrdata);
		$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/cluparco', {
			clname: $scope.className,
			colname: $scope.columnName,
			id: $scope.objectId,
			arrdata: arrdata
		}).
		success(function(data, status, headers, config) {
			console.log(data);
			console.log(status);
			toaster.pop(data.type, data.title, data.detail);
			console.log($scope.removeButtonDisabled);
			console.log($scope.gridRows);
			//$scope.gridRows.splice(index,1);
			delete $scope.removeButtonDisabled[item.objectId];
			console.log($scope.disabledRemoveButton);
			console.log($scope.gridRows);
		}).
		error(function(data, status, headers, config) {
			console.log("Request failed");
			console.log(status);
			toaster.pop("error", "Error", "Request failed");
			$scope.gridRows.splice(index,1);
		});

	};

	$scope.removeItem = function(item){
		var index = $scope.gridRows.indexOf(item);
		var tempItem = $scope.gridRows[index];
		var arrdata = _.without($scope.gridRows, _.findWhere($scope.gridRows, {objectId: item.objectId}));
		//$scope.gridRows.splice(index,1);
		$scope.removeButtonDisabled[item.objectId] = item.objectId;
		console.log($scope.gridRows);
		$http.post($location.protocol() + '://' + $location.host() + ':' + $location.port() + '/api/cluparco', {
			clname: $scope.className,
			colname: $scope.columnName,
			id: $scope.objectId,
			arrdata: arrdata
		}).
		success(function(data, status, headers, config) {
			console.log(data);
			console.log(status);
			toaster.pop(data.type, data.title, data.detail);
			console.log($scope.disabledRemoveButton);
			console.log($scope.gridRows);
			$scope.gridRows.splice(index,1);
			delete $scope.removeButtonDisabled[item.objectId];
			console.log($scope.disabledRemoveButton);
			console.log($scope.gridRows);
		}).
		error(function(data, status, headers, config) {
			console.log("Request failed");
			console.log(status);
			toaster.pop("error", "Error", "Request failed");
			$scope.gridRows.push(tempItem);
		});

	};

	$scope.checkingItems = function(selectItems, tableItems){
		 console.log("items en select: " + selectItems.length);
		console.log("items en tabla: " + tableItems.length);
		_.each(tableItems, function(ti){
			var tempItem = _.findWhere(selectItems, {objectId: ti.objectId});
			if(tempItem !== undefined){
				if(tempItem.objectId == ti.objectId){
						$scope.selectData = _.without($scope.selectData, _.findWhere($scope.selectData, {objectId: ti.objectId}));}
				}
		});
		console.log($scope.gridRows);

	};

	$scope.checkingButtons = function(){
		console.log('checking');
		if($scope.selectedItem != {}){
			$scope.addButtonDisabled = false;
			$scope.removeSelectItemDisabled= false;

		}
		else{
			$scope.addButtonDisabled = true;
			$scope.removeSelectItemDisabled = true;
		}
	};

	$scope.removeSelectItem = function(){
		$scope.selectedItem = {};
		$scope.checkingButtons();
	}

	//////////////////////////////////////////////////// Modal Functions

	$scope.ok = function() {
		$modalInstance.close($rootScope.modalClass);
	};

	$scope.cancel = function() {
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
			$log.info('Modal dismissed at: ' + new Date());
		});

	};


});
