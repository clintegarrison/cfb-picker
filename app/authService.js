var app = angular.module("cfbPicker")

app.service('authService', function(){
    var userIsAuthenticated = false;

    var userName = ''

    this.setUserAuthenticated = function(value){
      userIsAuthenticated = value;
    };

    this.getUserAuthenticated = function(){
      return userIsAuthenticated;
    };

    this.getUserName = function(){
      return userName;
    };

    this.setUserName = function(value){
      userName = value;
    };
})
