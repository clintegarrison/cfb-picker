var app = angular.module("cfbPicker")

app.controller("mainController", function ($scope, $location, authService) {

    $scope.navigateTo = function ( path ) {
      if(path==='/moneyLines'){
        $scope.myPicksButtonStyle = ''
        $scope.standingsButtonStyle = ''
        $scope.spreadsButtonStyle = ''
        $scope.totalsButtonStyle = ''
        $scope.moneyLinesButtonStyle = 'selectedButton'
      }else if(path==='/standings'){
        $scope.myPicksButtonStyle = ''
        $scope.standingsButtonStyle = 'selectedButton'
        $scope.spreadsButtonStyle = ''
        $scope.totalsButtonStyle = ''
        $scope.moneyLinesButtonStyle = ''
      }else if(path==='/myPicks'){
        $scope.myPicksButtonStyle = 'selectedButton'
        $scope.standingsButtonStyle = ''
        $scope.spreadsButtonStyle = ''
        $scope.totalsButtonStyle = ''
        $scope.moneyLinesButtonStyle = ''
      }else if(path==='/spreads'){
        $scope.myPicksButtonStyle = ''
        $scope.standingsButtonStyle = ''
        $scope.spreadsButtonStyle = 'selectedButton'
        $scope.totalsButtonStyle = ''
        $scope.moneyLinesButtonStyle = ''
      }else if(path==='/totals'){
        $scope.myPicksButtonStyle = ''
        $scope.standingsButtonStyle = ''
        $scope.spreadsButtonStyle = ''
        $scope.totalsButtonStyle = 'selectedButton'
        $scope.moneyLinesButtonStyle = ''
      }
      $location.path( path )
    };

    $scope.isAuthenticated = function(){
      $scope.userName = authService.getUserName();
      return authService.getUserAuthenticated()
    }

});
