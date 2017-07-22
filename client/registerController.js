'use strict'

var app = angular.module("cfbPicker", ['ngMaterial'])

app.controller("registerController", function($scope, $mdDialog) {
    $scope.test = "test"
    $scope.user = {userName: "", email: "", passwordOne: "", passwordTwo: "", }
    $scope.register = function() {
        console.log('regsiter')
        if($scope.user.passwordOne !== $scope.user.passwordTwo){
          console.log('p nope')
          $scope.showAlert()
          $scope.user.passwordOne = ""
          $scope.user.passwordTwo = ""
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
