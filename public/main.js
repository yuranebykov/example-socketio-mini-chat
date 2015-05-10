var socket = io.connect('http://127.0.0.1'); //IP адреса для LAN мережа
var app = angular.module('test', []);

app.controller("MainCtrl", ['$scope', 'arrServ', function($scope, arrServ) {
	$scope.canChange = {
		'afterSocket': true,
		'watch': false,
		'isFirst': true
	};

	$scope.question = "";
	$scope.dataQTA = [];
	socket.on('addDataQTA', function (data) {
		$scope.$apply(function() {
			$scope.dataQTA = data;
		});
	});

	socket.on('changeDataQTA', function(data) {
		if($scope.canChange.afterSocket) {
			switch(data.control) {
				case 'add': {
					$scope.$apply(function() {
						$scope.dataQTA.push({"question": data.dt, "answer": ""});
					});					
				}; break;

				case 'change': {
					$scope.$apply(function() {
						$scope.canChange.watch = false;
						$scope.dataQTA[data.id] = data.dt;
					});
				}
			}
		} else {
			$scope.canChange.afterSocket = true;
		}
	});

	$scope.addTextBox = function() {
		$scope.canChange.afterSocket = false;
		if(!$scope.question.trim()) $scope.question = "Без питання? Не може, бути!";		
		$scope.dataQTA.push({"question": $scope.question, "answer": ""});
		socket.emit('dataQTA', arrServ.add($scope.question));
	}
}]);

app.directive('textautosave', ['arrServ', function(arrServ) {
	return {
		restrict: 'A',
		link: function(scope, elem) {
			scope.$watch('item', function() {
				if(scope.$parent.canChange.watch) {
					scope.$parent.canChange.afterSocket = false;
					socket.emit('dataQTA', arrServ.change(scope.$index, scope.item));					
				} else if(scope.$parent.canChange.isFirst) {
					if(scope.$index == (scope.$parent.dataQTA.length - 1)) {
						scope.$parent.canChange.watch = true;
						scope.$parent.canChange.isFirst = false;						
					}
				} else {
					scope.$parent.canChange.watch = true;
				}				
			}, true);
		}
	}
}]);

app.service('arrServ', function() {
	this.add = function(data) {
		return {
			'control': 'add',
			'dt': data
		}
	};

	this.change = function(id, data) {
		return {
			'control': 'change',
			'id': id,
			'dt': data
		}		
	}
})