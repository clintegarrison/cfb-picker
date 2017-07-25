var app = angular.module("cfbPicker")

app.controller("summaryController", function ($scope, $http, $location) {
    $scope.greeting = "Summary Controller";

    $scope.navigateTo = function ( path ) {
      $location.path( path );
    };
});
