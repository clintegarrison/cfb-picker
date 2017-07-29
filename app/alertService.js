var app = angular.module("cfbPicker")

app.service('alertService', function($mdDialog){
    this.showAlert = function(msg) {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(angular.element(document.querySelector('#popupContainer')))
          .clickOutsideToClose(true)
          .title(msg)
          .ok('OK')
      );
    };


    this.showAdvanced = function(ev) {
        $mdDialog.show({
          //controller: dialogPicksController,
          templateUrl: 'dialogPicks.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true//,
          //fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
          //$scope.status = 'You said the information was "' + answer + '".';
        }, function() {
          //$scope.status = 'You cancelled the dialog.';
        });
      };

})
