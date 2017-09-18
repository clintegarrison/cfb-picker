'use strict'

var app = angular.module("cfbPicker")

app.controller("standingsController", function($scope, $http) {
  $scope.test = ' does this work'

  $scope.getStandings = function() {
      console.log('getStandings')
      $http({
        method: 'GET',
        url: '/getCreditsNew'
      }).then(function successCallback(response) {
          $scope.credits = response.data

          console.log('$scope.credits:', $scope.credits)
        }, function errorCallback(response) {
          console.log(response)
        });

        console.log('$scope.credits:', $scope.credits)
  };

  $scope.getStandings()

});
