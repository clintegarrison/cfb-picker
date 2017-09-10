var app = angular.module("cfbPicker")

app.controller("resultsController", function ($scope, $http) {

  $scope.getResults = function(){
    $scope.isLoading = true

    var resData = [
      {
        "weekTitle": "Week One Picks",
        "userPicks": [
          {
            "user": "clint",
            "picks": [
              {
                "pickType": "spread"
              },
              {
                "pickType": "parlay",
                "picks": [
                  {
                    "pickType": "totals"
                  },
                  {
                    "pickType": "moneyLine"
                  }
                ]
              }
            ]
          },
          {
            "user": "roy",
            "picks": [
              {
                "pickType": "spread"
              },
              {
                "pickType": "parlay",
                "picks": [
                  {
                    "pickType": "totals"
                  },
                  {
                    "pickType": "moneyLine"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "weekTitle": "Week Two Picks",
        "userPicks": [
          {
            "user": "clint",
            "picks": [
              {
                "pickType": "spread"
              },
              {
                "pickType": "parlay",
                "picks": [
                  {
                    "pickType": "totals"
                  },
                  {
                    "pickType": "moneyLine"
                  }
                ]
              }
            ]
          },
          {
            "user": "roy",
            "picks": [
              {
                "pickType": "spread"
              },
              {
                "pickType": "parlay",
                "picks": [
                  {
                    "pickType": "totals"
                  },
                  {
                    "pickType": "moneyLine"
                  }
                ]
              }
            ]
          }
        ]
      }
    ]

    $scope.resData = resData

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
