'use strict'

var app = angular.module("cfbPicker")

app.controller("registerController", function($scope, $http, $location, alertService) {
    $scope.test = "test"
    $scope.user = {userName: "", email: "", passwordOne: "", passwordTwo: "", }
    $scope.register = function() {
        console.log('regsiter')
        if($scope.user.passwordOne !== $scope.user.passwordTwo){
          alertService.showAlert('Passwords do not match')
          $scope.user.passwordOne = ""
          $scope.user.passwordTwo = ""
        }else{
          //Call the services
          console.log(JSON.stringify($scope.user))

          $http({
            method: 'POST',
            url: '/register',
            data: JSON.stringify($scope.user),
            headers: {'Content-Type': 'application/json'}
          }).then(function successCallback(response) {
              $location.path('/summary');
            }, function errorCallback(response) {
              showAlert('Whoops, something failed')
            });
        }

        console.log($scope.user)
    };

});
