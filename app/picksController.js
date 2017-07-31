var app = angular.module("cfbPicker")

app.controller("picksController", function ($scope, $http, $mdDialog, authService) {

  console.log('picksController - HERE')

  $scope.cancel = function() {
      $mdDialog.cancel();
    };

  $scope.parlay = function() {
    console.log('parlay')
  }

  $scope.confirm = function() {
    console.log('confirm')
    var pick = {
      "pickType": $scope.pickType,
      "pickTeam": $scope.pickTeam,
      "pickNumber": $scope.pickNumber,
      "userName": authService.getUserName()
    }

    $http({
      method: 'POST',
      url: '/makePick',
      data: JSON.stringify(pick),
      headers: {'Content-Type': 'application/json'}
    }).then(function successCallback(response) {
        $mdDialog.cancel()
      }, function errorCallback(response) {

    });
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



  $scope.pickPrompt = function(pickType, pickTeam, pickNumber) {
      console.log('pickType:', pickType,' pickTeam:', pickTeam,' pickNumber:', pickNumber)
      $scope.pickType=pickType
      $scope.pickTeam=pickTeam
      $scope.pickNumber=pickNumber

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
