var app = angular.module("cfbPicker")

app.controller("picksController", function ($scope, $http, $mdDialog, authService, parlayService, weekService) {

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

    $scope.wagerAmounts = [50,100]

    if(parlayService.getParlays().length == 1){
      $scope.disableConfirmParlay = true
    }else{
      $scope.disableConfirmParlay = false
    }

    $scope.confirmText = 'Confirm Parlay'
  }

  $scope.deleteParlayPick = function(parlayPick){
    parlayService.deleteParlayPick(parlayPick)
    if(parlayPick===$scope.pick){
      $scope.disableParlay = false
      $scope.disableConfirmParlay = false
    }
    console.log('plen:', parlayService.getParlays().length)
    if(parlayService.getParlays().length===0){
      $scope.confirmText = 'Confirm Pick'
    }

    if(parlayService.getParlays().length > 0){
      $scope.wagerAmounts = [50,100]
    }else{
      $scope.wagerAmounts = [110,220]
    }
  }

  $scope.confirm = function(pickAmount) {
    // console.log(pickAmount)
    if (typeof pickAmount != 'undefined'){

      console.log(weekService.getCurrentWeekDate())

      if($scope.confirmText==='Confirm Pick'){

        $scope.pick.userName = authService.getUserName()
        $scope.pick.timestamp = new Date().toJSON()
        $scope.pick.pickAmount = pickAmount
        $scope.pick.weekNumber = weekService.getCurrentWeek()

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
          $scope.spreads = [];
          for (i = 0; i < response.data.length; i++) {
              if(response.data[i].spreadTeamOne.includes('br') || response.data[i].spreadTeamTwo.includes('br')){
                response.data[i].spreadTeamOne = ''
                response.data[i].spreadTeamTwo = ''
                response.data[i].disablePick = true
              }
              if($scope.hasGameStarted(response.data[i].gameTime)){
                response.data[i].disablePick=true
              }
              $scope.spreads.push(response.data[i])
          }
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
              if($scope.hasGameStarted(response.data[i].gameTime)){
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


  $scope.selectPick = function(pickType, pickTeam, pickNumber, opponentTeam, opponentNumber, gameTime){
    console.log('selectPick')
    $scope.pick = {
      'pickType': pickType,
      'pickTeam': pickTeam,
      'pickNumber': pickNumber,
      'opponentTeam': opponentTeam,
      'opponentNumber': opponentNumber,
      'gameTime': gameTime
    }
    console.log($scope.pick)

    if(pickType==="moneyLine" || parlayService.getParlays().length > 3){
      $scope.disableParlay = true
    }else{
      $scope.disableParlay = false
    }
    console.log('PARLAY COUNT:', parlayService.getParlays().length)
    if(pickType==="moneyLine" || parlayService.getParlays().length > 0){
      $scope.wagerAmounts = [50,100]
    }else{
      $scope.wagerAmounts = [110,220]
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

              if(response.data[i].moneyLineTeamOne.indexOf('&nbsp;') >= 0 || response.data[i].moneyLineTeamTwo.indexOf('&nbsp;') >= 0){
                response.data[i].moneyLineTeamOne = ''
                response.data[i].moneyLineTeamTwo = ''
                response.data[i].teamOneDisabled=true
                response.data[i].teamTwoDisabled=true
              }

              if($scope.hasGameStarted(response.data[i].gameTime)){
                response.data[i].teamOneDisabled=true
                response.data[i].teamTwoDisabled=true
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
    $http({
      method: 'GET',
      url: '/getServerTime'
    }).then(function successCallback(serverTimeResponse) {
        $scope.serverDate = new Date(serverTimeResponse.data)
        $scope.moneyLines()
        $scope.getSpreads()
        $scope.getTotals()
        $scope.parlays = parlayService.getParlays()
        $scope.confirmText = 'Confirm Pick'
      })
  }

  $scope.init()

  $scope.hasGameStarted = function(gameTime){
    console.log('hasGameStarted START gameTime:', gameTime)
    if(gameTime!=null){
      var gameStart = new Date()
      gameStart.setMonth(gameTime.substring(0,2) - 1, gameTime.substring(3,5))
      var hours = 0;
      console.log('hours before: ', parseInt(gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':'))))
      if(gameTime.slice(-2) == 'PM'){
        console.log('PM')
        if(parseInt(gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':')))!=12){
          hours = 12 + parseInt(gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':')))
        }else{
          hours = 12
        }
      }else{
        console.log('no PM')
        hours = gameTime.substring(gameTime.indexOf(' '), gameTime.indexOf(':'))
      }
      console.log('hours after: ',hours)
      gameStart.setHours(hours)
      var minsSubStr = gameTime.substring(gameTime.indexOf(':'), gameTime.length)
      gameStart.setMinutes(minsSubStr.substring(1, minsSubStr.indexOf(' ')))

      console.log('gameStart:',gameStart)
      console.log('currentServerTime:',$scope.serverDate)
      if(gameStart < $scope.serverDate){
        console.log('game HAS started')
        return true
      }else{
        console.log('game has NOT started')
        return false
      }
    }else{
      return false
    }
  }
})
