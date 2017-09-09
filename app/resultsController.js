var app = angular.module("cfbPicker")

app.controller("resultsController", function ($scope, $http) {

  $scope.getResults = function(){
    $scope.isLoading = true

    var singleGamePick = {
    	"pickType": "spread",
    	"pickTeam": "Oklahoma State",
    	"pickNumber": "-28",
    	"opponentTeam": "South Alabama",
    	"opponentNumber": "+28",
    	"gameTime": "09/08  8:00 PM",
    	"userName": "RyanBarksdale",
    	"timestamp": "2017-09-06T16:55:05.144Z",
    	"pickAmount": 220,
    	"weekNumber": 2
    }

    var parlayPick = {
    	"pickType": "parlay",
    	"pickAmount": 100,
    	"userName": "Iamthewoodlands",
    	"parlays": [{
    		"pickType": "spread",
    		"pickTeam": "Colorado State",
    		"pickNumber": "+3.5",
    		"opponentTeam": "Colorado",
    		"opponentNumber": "-3.5",
    		"gameTime": "09/01  8:00 PM",
    		"userName": "Iamthewoodlands",
    		"timestamp": "2017-09-01T21:05:14.714Z"
    	}, {
    		"pickType": "spread",
    		"pickTeam": "South Carolina",
    		"pickNumber": "+5",
    		"opponentTeam": "North Carolina State",
    		"opponentNumber": "-5",
    		"gameTime": "09/02  3:00 PM",
    		"userName": "Iamthewoodlands",
    		"timestamp": "2017-09-01T21:05:35.363Z"
    	}]
    }

    var picks = []
    picks.push(singleGamePick)
    picks.push(parlayPick)

    $scope.results = picks

    $scope.isLoading = false

    // $http({
    //   method: 'GET',
    //   url: '/calculateResults'
    // }).then(function successCallback(response) {
    //     console.log(typeof response.data)
    //     $scope.results = response.data
    //     $scope.isLoading = false
    //   }, function errorCallback(response) {
    //     console.log(response)
    //     $scope.isLoading = false
    //   });
  }

  $scope.getResults()
})
