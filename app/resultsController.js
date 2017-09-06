var app = angular.module("cfbPicker")

app.controller("resultsController", function ($scope, $http) {

  $scope.getResults = function(){
    $scope.isLoading = true
    $http({
      method: 'GET',
      url: '/calculateReults'
    }).then(function successCallback(response) {
        console.log(typeof response.data)
        $scope.results = response.data
        $scope.isLoading = false
      }, function errorCallback(response) {
        console.log(response)
        $scope.isLoading = false
      });
  }

  $scope.getResults()
})
