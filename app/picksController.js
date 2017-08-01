var app = angular.module("cfbPicker")

app.controller("picksController", function ($scope, $http, $mdDialog, authService) {

  console.log('picksController - HERE')

  $scope.cancel = function() {
      $mdDialog.cancel();
    };

  $scope.parlay = function(pickAmount) {
    console.log('parlay', pickAmount)
  }

  $scope.confirm = function(pickAmount) {

    $scope.pick.userName = authService.getUserName()
    $scope.pick.timestamp = new Date().toJSON()
    $scope.pick.pickAmount = pickAmount

    console.log($scope.pick)

    $http({
      method: 'POST',
      url: '/makePick',
      data: JSON.stringify($scope.pick),
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


  $scope.selectPick = function(pickType, pickTeam, pickNumber, opponentTeam, opponentNumber){
    console.log('selectPick')
    $scope.pick = {
      'pickType': pickType,
      'pickTeam': pickTeam,
      'pickNumber': pickNumber,
      'opponentTeam': opponentTeam,
      'opponentNumber': opponentNumber
    }

    $mdDialog.show({
      controller: () => this,
      controllerAs: 'sharedPicksController',
      templateUrl: 'dialogPicks.html',
      parent: angular.element(document.body),
      clickOutsideToClose:true
    })
  }

  $scope.moneyLines = function() {
      console.log('moneyLines')
      $http({
        method: 'GET',
        url: 'https://odds-service.herokuapp.com/getMoneyLines'
      }).then(function successCallback(response) {
          console.log(response)
          $scope.moneyLines = response.data
        }, function errorCallback(response) {
          console.log(response)
        });
  };

  $scope.init = function(){
    $scope.moneyLines()
    $scope.getSpreads()
  }

  $scope.init()
})
