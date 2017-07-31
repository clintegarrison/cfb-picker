var app = angular.module("cfbPicker")

app.controller("mainController", function ($scope, $location, authService) {

    $scope.navigateTo = function ( path ) {
      console.log('nav')
      $location.path( path );
    };

    $scope.isAuthenticated = function(){
      return authService.getUserAuthenticated()
    }

    $scope.userName = authService.getUserName();

});
