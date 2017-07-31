var app = angular.module("cfbPicker")

app.controller("myPicksController", function ($scope, $http, authService) {
    console.log('mpc')

    $scope.getMyPicks = function() {
        console.log('picks')
        $http({
          method: 'GET',
          url: '/getPicks',
          params: {userName: authService.getUserName()}
        }).then(function successCallback(response) {
            console.log(response)
            $scope.myPicks = response.data
          }, function errorCallback(response) {
            console.log(response)
          });
    };

    $scope.getMyPicks();
});
