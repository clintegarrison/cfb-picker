var app = angular.module("cfbPicker")

app.controller("loginController", function ($scope, authService, $location, alertService, $http) {

    $scope.register = function() {
        console.log('register')
        $location.path('/register')
    };

    $scope.login = function() {
        console.log('login')
        if (typeof $scope.userName == 'undefined' || $scope.userName === ""){
          alertService.showAlert('Please eneter a username')
        }else if(typeof $scope.password == 'undefined' || $scope.password === ""){
          alertService.showAlert('Please eneter a password')
        }else{
          var loginPayload = {
            userName: $scope.userName,
            password: $scope.password
          }
          console.log(loginPayload)
          $http({
            method: 'POST',
            url: '/authenticate',
            data: JSON.stringify(loginPayload),
            headers: {'Content-Type': 'application/json'}
          }).then(function successCallback(response) {
              authService.setUserAuthenticated(true)
              console.log('authed')
              $location.path('/home')
            }, function errorCallback(response) {
              alertService.showAlert('Invalid credentials')
            });
        }
    };
});
