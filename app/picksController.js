var app = angular.module("cfbPicker")

app.controller("picksController", function ($scope, $http, $mdDialog, authService) {

  console.log('picksController - HERE')

  $scope.cancel = function() {
      $mdDialog.cancel();
    };

  $scope.parlay = function() {
    console.log('parlay', $scope.pick)
    $scope.pick.userName = authService.getUserName()
    $scope.pick.timestamp = new Date().toJSON()

    $scope.parlays.push($scope.pick);
    $scope.disableParlay = true

    $scope.confirmText = 'Confirm Parlay'
  }

  $scope.deleteParlayPick = function(parlayPick){
    var index = $scope.parlays.indexOf(parlayPick)
    console.log('$scope.parlays size',$scope.parlays.length)
    $scope.parlays.splice(index, 1)
    if(parlayPick===$scope.pick){
      $scope.disableParlay = false
    }
    if($scope.parlays.length===0){
      $scope.confirmText = 'Confirm Pick'
    }
  }

  $scope.confirm = function(pickAmount) {

    if($scope.confirmText==='Confirm Pick'){
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
          $mdDialog.cancel()
      });
    }else{
      console.log('confrim parlay')

      var parylayPick = {
        pickType: "parlay",
        pickAmount: pickAmount,
        userName: authService.getUserName(),
        parlays:  $scope.parlays
      }

      console.log('parylayPick', parylayPick)

      $http({
        method: 'POST',
        url: '/makePick',
        data: JSON.stringify(parylayPick),
        headers: {'Content-Type': 'application/json'}
      }).then(function successCallback(response) {
          $mdDialog.cancel()
        }, function errorCallback(response) {
          $mdDialog.cancel()
      });

      $scope.parlays = []
    }
  }

  $scope.getSpreads = function() {
      console.log('spreads')
      $scope.isLoading = true
      $http({
        method: 'GET',
        url: 'https://odds-service.herokuapp.com/getSpreads'
      }).then(function successCallback(response) {
          console.log(response)
          $scope.spreads = response.data
          $scope.isLoading = false
        }, function errorCallback(response) {
          console.log(response)
          $scope.isLoading = false
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
    console.log($scope.pick)

    console.log('parlays', $scope.parlays)

    if(pickType==="moneyLine" || $scope.parlays.length > 3){
      $scope.disableParlay = true
    }else{
      $scope.disableParlay = false
    }
    console.log('$scope.parlayEnabled:',$scope.disableParlay)

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
      $scope.isLoading = true
      $http({
        method: 'GET',
        url: 'https://odds-service.herokuapp.com/getMoneyLines'
      }).then(function successCallback(response) {
          console.log(response)
          $scope.moneyLines = response.data
          $scope.isLoading = false
        }, function errorCallback(response) {
          console.log(response)
          $scope.isLoading = false
        });
  };

  $scope.init = function(){
    $scope.moneyLines()
    $scope.getSpreads()
    $scope.parlays = []
    $scope.confirmText = 'Confirm Pick'
  }

  $scope.init()
})
