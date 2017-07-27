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
})
