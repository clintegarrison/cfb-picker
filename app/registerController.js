'use strict'

var app = angular.module("cfbPicker")

app.controller("registerController", function($scope, $mdDialog, $http) {
    $scope.test = "test"
    $scope.user = {userName: "", email: "", passwordOne: "", passwordTwo: "", }
    $scope.register = function() {
        console.log('regsiter')
        if($scope.user.passwordOne !== $scope.user.passwordTwo){
          console.log('p nope')
          $scope.showAlert()
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
              // this callback will be called asynchronously
              // when the response is available
            }, function errorCallback(response) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
        }

        console.log($scope.user)
    };

    $scope.showAlert = function(ev) {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(true)
          .title('Passwords do not match')
          .ok('OK')
          .targetEvent(ev)
      );
  };
});
