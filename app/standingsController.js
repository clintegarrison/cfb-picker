'use strict'

var app = angular.module("cfbPicker")

app.controller("standingsController", function($scope, $http) {
  $scope.test = ' does this work'

  $scope.getStandings = function() {
      console.log('getStandings')
      $http({
        method: 'GET',
        url: '/getCredits'
      }).then(function successCallback(response) {
          $scope.credits = []
          for(var i=0; i<response.data.length; i++){
            $scope.credits.push(JSON.parse(response.data[i]))
          }

          console.log('$scope.credits:', $scope.credits)
        }, function errorCallback(response) {
          console.log(response)
        });

        console.log('$scope.credits:', $scope.credits)
  };

  $scope.getStandings()

});
