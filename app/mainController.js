var app = angular.module("cfbPicker")

app.controller("mainController", function ($scope, $location, authService) {

    $scope.navigateTo = function ( path ) {
      console.log('nav')
      $location.path( path );
    };

    $scope.isAuthenticated = function(){
      $scope.userName = authService.getUserName();
      return authService.getUserAuthenticated()
    }

});
