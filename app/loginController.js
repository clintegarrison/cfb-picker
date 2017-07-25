var app = angular.module("cfbPicker")

app.controller("loginController", function ($scope) {
    $scope.greeting = "Login Controller";

    $scope.register = function() {
        console.log('register')
    };

    $scope.login = function() {
        console.log('login')
        // if($scope.user.passwordOne !== $scope.user.passwordTwo){
        //   console.log('p nope')
        //   $scope.showAlert()
        //   $scope.user.passwordOne = ""
        //   $scope.user.passwordTwo = ""
        // }else{
        //   //Call the services
        //   console.log(JSON.stringify($scope.user))
        //
        //   $http({
        //     method: 'POST',
        //     url: '/register',
        //     data: JSON.stringify($scope.user),
        //     headers: {'Content-Type': 'application/json'}
        //   }).then(function successCallback(response) {
        //       // this callback will be called asynchronously
        //       // when the response is available
        //     }, function errorCallback(response) {
        //       // called asynchronously if an error occurs
        //       // or server returns response with an error status.
        //     });
        // }
        //
        // console.log($scope.user)
    };
});
