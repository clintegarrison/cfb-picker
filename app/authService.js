var app = angular.module("cfbPicker")

app.service('authService', function(){
    var userIsAuthenticated = false;

    this.setUserAuthenticated = function(value){
      userIsAuthenticated = value;
    };

    this.getUserAuthenticated = function(){
      return userIsAuthenticated;
    };
})
