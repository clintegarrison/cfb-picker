var app = angular.module("cfbPicker")

app.controller("picksController", function ($scope, $http, $mdDialog, authService, parlayService) {

  console.log('picksController - HERE')

  $scope.cancel = function() {
      $mdDialog.cancel();
    };

  $scope.parlay = function() {
    console.log('parlay', $scope.pick)
    $scope.pick.userName = authService.getUserName()
    $scope.pick.timestamp = new Date().toJSON()

    parlayService.addParlay($scope.pick)

    $scope.disableParlay = true

    $scope.confirmText = 'Confirm Parlay'
  }

  $scope.deleteParlayPick = function(parlayPick){
    parlayService.deleteParlayPick(parlayPick)
    if(parlayPick===$scope.pick){
      $scope.disableParlay = false
    }
    if(parlayService.getParlays().length===0){
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
        parlays:  parlayService.getParlays()
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

      parlayService.clearAllParlays()
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

  $scope.getTotals = function() {
      console.log('totals')
      $scope.isLoading = true
      $http({
        method: 'GET',
        url: 'https://odds-service.herokuapp.com/getTotals'
      }).then(function successCallback(response) {
          console.log(response)

          $scope.totals = [];
          for (i = 0; i < response.data.length; i++) {
              if(response.data[i].totalPoints === ''){
                response.data[i].disablePick=true
              }

              $scope.totals.push(response.data[i])
          }

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

    if(pickType==="moneyLine" || parlayService.getParlays().length > 3){
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

          $scope.moneyLines = [];
          for (i = 0; i < response.data.length; i++) {
              if(response.data[i].moneyLineTeamOne.indexOf('-') >= 0){
                response.data[i].teamOneDisabled=true
              }else{
                response.data[i].teamOneDisabled=false
              }

              if(response.data[i].moneyLineTeamTwo.indexOf('-') >= 0){
                response.data[i].teamTwoDisabled=true
              }else{
                response.data[i].teamTwoDisabled=false
              }

              $scope.moneyLines.push(response.data[i])
          }

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
    $scope.getTotals()
    $scope.parlays = parlayService.getParlays()
    $scope.confirmText = 'Confirm Pick'
  }

  $scope.init()
})
