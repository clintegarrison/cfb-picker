var app = angular.module("cfbPicker")

app.controller("mainController", function ($scope, $http, $location) {

    $scope.navigateTo = function ( path ) {
      console.log('nav')
      $location.path( path );
    };
});
