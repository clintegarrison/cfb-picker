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
  .when("/moneyLines", {
    controller: 'moneyLinesController',
    templateUrl : "moneyLines.html"
  })
  .when("/spreads", {
    controller: 'picksController',
    templateUrl : "spreads.html"
  })
  .when("/moneyLines", {
    controller: 'picksController',
    templateUrl : "moneyLines.html"
  })
  .when("/myPicks", {
    controller: 'myPicksController',
    templateUrl : "myPicks.html"
  })
  .when("/standings", {
    controller: 'standingsController',
    templateUrl : "standings.html"
  })
  .when("/totals", {
    controller: 'picksController',
    templateUrl : "totals.html"
  })
  .when("/results", {
    controller: 'resultsController',
    templateUrl : "results.html"
  })
  .otherwise("/login", {
    controller: 'loginController',
    templateUrl : "login.html"
  })
})

app.run(['$rootScope', '$location','authService', function($rootScope, $location, authService){
  console.log('running')
  console.log(authService.getUserAuthenticated())

  $rootScope.$on('$routeChangeStart', function (event, next) {
      if(!authService.getUserAuthenticated() && next.originalPath!==('/login') && next.originalPath!==('/register')){
        event.preventDefault();
        $location.path('/login');
      }
  });

}])
