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

        }, function errorCallback(response) {
          // alertService.showAlert('Invalid credentials')
        });
    }

    $scope.getMyPicks = function() {
        console.log('picks')
        $http({
          method: 'GET',
          url: '/getPicks',
          params: {userName: authService.getUserName()}
        }).then(function successCallback(response) {
            console.log(typeof response.data)
            $scope.myPicks = [];
            for (i = 0; i < response.data.length; i++) {
                var jsonPick = JSON.parse(response.data[i])
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
                  stringPick += response.data[i]
                }else{
                  stringPick += response.data[i]
                }
                var newJsonPick = {
                  pickNumber: i,
                  prettyPrint: stringPick,
                  originalPick: jsonPick
                }
                $scope.myPicks.push(newJsonPick);
            }
          }, function errorCallback(response) {
            console.log(response)
          });
          console.log('$scope.myPicks:',$scope.myPicks)
    };

    $scope.getMyPicks();
});
