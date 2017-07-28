var app = angular.module("cfbPicker")

app.controller("homeController", function ($scope, authService) {
  $scope.isAuthed = function() {
      console.log('isAuthed:', authService.getUserAuthenticated())
    }

    $scope.isAuthed()
})
