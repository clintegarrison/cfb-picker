var app = angular.module("cfbPicker")

app.controller("picksController", function ($scope, $http, $mdDialog) {

  console.log('picksController - HERE')

  $scope.cancel = function() {
      $mdDialog.cancel();
    };

  $scope.parlay = function() {
    console.log('parlay',$scope.currentPick)
  }

  $scope.confirm = function() {
    console.log('confirm')
  }

  $scope.getSpreads = function() {
      console.log('spreads')
      $http({
        method: 'GET',
        url: 'https://odds-service.herokuapp.com/getSpreads'
      }).then(function successCallback(response) {
          console.log(response)
          $scope.spreads = response.data
        }, function errorCallback(response) {
          console.log(response)
        });
  };



  $scope.pickPrompt = function(pick) {
      console.log('pick', pick)
      $scope.currentPick=pick
      $mdDialog.show({
        controller: () => this,
        controllerAs: 'sharedPicksController',
        templateUrl: 'dialogPicks.html',
        parent: angular.element(document.body),
        clickOutsideToClose:true
      })
      .then(function(answer) {
        //$scope.status = 'You said the information was "' + answer + '".';
      }, function() {
        //$scope.status = 'You cancelled the dialog.';
      });
  };

  $scope.getSpreads();
})
