'use strict'

var app = angular.module("cfbPicker", ['ngMaterial', 'ngRoute'])

app.config(function($routeProvider,$locationProvider){
  $locationProvider.html5Mode(true)
  $routeProvider
  .when("/testOne", {
    controller: 'testOneController',
    templateUrl : "testOne.html"
  })
  .when("/register", {
    templateUrl : "register.html"
  })
})

app.controller("testOneController", function ($scope) {
    $scope.greeting = "Test One Controller";
});
