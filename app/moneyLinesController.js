var app = angular.module("cfbPicker")

app.controller("moneyLinesController", function ($scope, $http) {

    $scope.moneyLines = function() {
        console.log('moneyLines')
        $http({
          method: 'GET',
          url: 'https://odds-service.herokuapp.com/getMoneyLines'
        }).then(function successCallback(response) {
            console.log(response)
            $scope.moneyLines = response.data
          }, function errorCallback(response) {
            console.log(response)
          });
    };

    $scope.moneyLines();
});
