var app = angular.module("cfbPicker")

app.controller("resultsController", function ($scope, $http) {

  $scope.getResults = function(){
    $scope.isLoading = true

    $http({
      method: 'GET',
      url: '/getResults?weekNumber=1'
    }).then(function successCallback(response) {
        console.log(typeof response.data)
        $scope.weekOneResults = response.data
        $scope.isLoading = false
      }, function errorCallback(response) {
        console.log(response)
        $scope.isLoading = false
      });

      $http({
        method: 'GET',
        url: '/getResults?weekNumber=2'
      }).then(function successCallback(response) {
          console.log(typeof response.data)
          $scope.weekTwoResults = response.data
          $scope.isLoading = false
        }, function errorCallback(response) {
          console.log(response)
          $scope.isLoading = false
        });

        $http({
          method: 'GET',
          url: '/getResults?weekNumber=3'
        }).then(function successCallback(response) {
            console.log(typeof response.data)
            $scope.weekThreeResults = response.data
            $scope.isLoading = false
          }, function errorCallback(response) {
            console.log(response)
            $scope.isLoading = false
          });

          $http({
            method: 'GET',
            url: '/getResults?weekNumber=4'
          }).then(function successCallback(response) {
              console.log(typeof response.data)
              $scope.weekFourResults = response.data
              $scope.isLoading = false
            }, function errorCallback(response) {
              console.log(response)
              $scope.isLoading = false
            });

            $http({
              method: 'GET',
              url: '/getResults?weekNumber=5'
            }).then(function successCallback(response) {
                console.log(typeof response.data)
                $scope.weekFiveResults = response.data
                $scope.isLoading = false
              }, function errorCallback(response) {
                console.log(response)
                $scope.isLoading = false
              });

              $http({
                method: 'GET',
                url: '/getResults?weekNumber=6'
              }).then(function successCallback(response) {
                  console.log(typeof response.data)
                  $scope.weekSixResults = response.data
                  $scope.isLoading = false
                }, function errorCallback(response) {
                  console.log(response)
                  $scope.isLoading = false
                });
  }

  $scope.getResults()
})
