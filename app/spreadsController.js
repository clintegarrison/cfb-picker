var app = angular.module("cfbPicker")

app.controller("spreadsController", function ($scope, $http, alertService) {

    $scope.getSpreads = function() {
        console.log('spreads')
        $http({
          method: 'GET',
          url: 'https://odds-service.herokuapp.com/getSpreads'
        }).then(function successCallback(response) {
            console.log(response)
            $scope.spreads = response.data
          }, function errorCallback(response) {
            console.log(response)
          });
    };

    $scope.pickPrompt = function(pick) {
        console.log('pick')
        alertService.showAdvanced()
    };

    $scope.getSpreads();
});
