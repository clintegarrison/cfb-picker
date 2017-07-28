var app = angular.module("cfbPicker")

app.service('authService', function(){
    var userIsAuthenticated = true;

    this.setUserAuthenticated = function(value){
      userIsAuthenticated = value;
    };

    this.getUserAuthenticated = function(){
      return userIsAuthenticated;
    };
})
