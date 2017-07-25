'use strict'

var app = angular.module("cfbPicker", ['ngMaterial', 'ngRoute'])

app.config(function($routeProvider,$locationProvider){
  $locationProvider.html5Mode(true)
  $routeProvider
  .when("/login", {
    controller: 'loginController',
    templateUrl : "login.html"
  })
  .when("/register", {
    controller: 'registerController',
    templateUrl : "register.html"
  })
  .when("/", {
    controller: 'summaryController',
    templateUrl : "summary.html"
  })
  .when("/moneyLines", {
    controller: 'moneyLinesController',
    templateUrl : "moneyLines.html"
  })
})
