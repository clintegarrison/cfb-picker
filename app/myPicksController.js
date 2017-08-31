var app = angular.module("cfbPicker")

app.controller("myPicksController", function ($scope, $http, authService) {
    console.log('mpc')

    $scope.delete = function(pick){
      console.log('delete:',pick)

      $http({
        method: 'POST',
        url: '/deletePick',
        data: JSON.stringify(pick),
        headers: {'Content-Type': 'application/json'}
      }).then(function successCallback(response) {
          $scope.getMyPicks()
        }, function errorCallback(response) {
        });
    }

    $scope.getMyPicks = function() {
        $scope.isLoading = true
        console.log('picks')
        var games = []
        $http({
          method: 'GET',
          url: 'https://cfb-scores-api.herokuapp.com/v1/date/20170826'
        }).then(function successCallback(response) {
          games = response.data.games
          console.log(games)

          $http({
            method: 'GET',
            url: '/getPicks',
            params: {userName: authService.getUserName()}
          }).then(function successCallback(response) {
              console.log(typeof response.data)
              $scope.myPicks = [];
              for (i = 0; i < response.data.length; i++) {
                  var jsonPick = JSON.parse(response.data[i])
                  console.log('@@@@@@@', jsonPick)
                  var stringPick = ''
                  if(jsonPick.pickType==="spread"){
                    stringPick += jsonPick.pickTeam
                    stringPick += ' to cover '
                    stringPick += jsonPick.pickNumber
                    stringPick += ' against '
                    stringPick += jsonPick.opponentTeam
                    stringPick += ' for '
                    stringPick += jsonPick.pickAmount
                    stringPick += ' credits. '
                  }else if(jsonPick.pickType==="moneyLine"){
                    stringPick += jsonPick.pickTeam
                    stringPick += ' ('
                    stringPick += jsonPick.pickNumber
                    stringPick += ') to win outright against '
                    stringPick += jsonPick.opponentTeam
                    stringPick += ' for '
                    stringPick += jsonPick.pickAmount
                    stringPick += ' credits. '
                    stringPick += '\n'
                  }else if(jsonPick.pickType==="parlay"){
                    var parlays = jsonPick.parlays
                    stringPick += jsonPick.parlays.length
                    stringPick += ' way parlay for '
                    stringPick += jsonPick.pickAmount
                    stringPick += ' credits. \n'
                    for(x = 0; x <jsonPick.parlays.length; x++){
                      if(jsonPick.parlays[x].pickType==="spread"){
                        stringPick += ' - '
                        stringPick += jsonPick.parlays[x].pickTeam
                        stringPick += ' to cover '
                        stringPick += jsonPick.parlays[x].pickNumber
                        stringPick += ' against '
                        stringPick += jsonPick.parlays[x].opponentTeam
                        stringPick += '\n'
                      }else if(jsonPick.parlays[x].pickType==="totals"){
                        stringPick += ' - '
                        stringPick += jsonPick.parlays[x].pickTeam
                        stringPick += ' and '
                        stringPick += jsonPick.parlays[x].opponentTeam
                        stringPick += ' to score '
                        stringPick += jsonPick.parlays[x].pickNumber
                        stringPick += '\n'
                      }
                    }
                  }else if(jsonPick.pickType==="totals"){
                    stringPick += jsonPick.pickTeam
                    stringPick += ' vs '
                    stringPick += jsonPick.opponentTeam
                    stringPick += ' to score '
                    stringPick += jsonPick.pickNumber
                    stringPick += ' for '
                    stringPick += jsonPick.pickAmount
                    stringPick += ' credits. '
                  }
                  var disabledPick = false

                  console.log('jsonPick.gameTime:',jsonPick.gameTime)
                  if(jsonPick.gameTime!=null){
                    var gameStart = new Date()
                    gameStart.setMonth(jsonPick.gameTime.substring(0,2) - 1, jsonPick.gameTime.substring(3,5))
                    console.log('am/pm:',jsonPick.gameTime.slice(-2))
                    var hours = 0;
                    if(jsonPick.gameTime.slice(-2) == 'PM'){
                      hours = 12 + parseInt(jsonPick.gameTime.substring(jsonPick.gameTime.indexOf(' '), jsonPick.gameTime.indexOf(':')))
                    }else{
                      hours = jsonPick.gameTime.substring(jsonPick.gameTime.indexOf(' '), jsonPick.gameTime.indexOf(':'))
                    }
                    console.log('hours:', hours)
                    gameStart.setHours(hours)
                    var minsSubStr = jsonPick.gameTime.substring(jsonPick.gameTime.indexOf(':'), jsonPick.gameTime.length)
                    console.log('minutes:', minsSubStr.substring(1, minsSubStr.indexOf(' ')))
                    gameStart.setMinutes(minsSubStr.substring(1, minsSubStr.indexOf(' ')))
                    console.log('gameStart:',gameStart)
                    var now = new Date()
                    if(gameStart < now){
                      disabledPick = true
                    }
                  }else{
                    // this is for the week zero picks that didn't record gameTime
                    var pickTime = null
                    if(jsonPick.pickType=='parlay'){
                      pickTime = new Date(jsonPick.parlays[0].timestamp)
                    }else{
                      pickTime = new Date(jsonPick.timestamp)
                    }
                    var beforeGameTimesAddedToPicks = new Date('2017-08-28T18:25:43.511Z')
                    if(pickTime < beforeGameTimesAddedToPicks){
                      disabledPick = true
                    }
                  }

                  var newJsonPick = {
                    pickNumber: i,
                    prettyPrint: stringPick,
                    originalPick: jsonPick,
                    disabled: disabledPick
                  }
                  $scope.myPicks.push(newJsonPick);
              }
              $scope.isLoading = false
            }, function errorCallback(response) {
              console.log(response)
              $scope.isLoading = false
            });
        })


          console.log('$scope.myPicks:',$scope.myPicks)
    };


    $scope.getMyPicks();
});
