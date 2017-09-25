var app = angular.module("cfbPicker")

app.service('weekService', function(){

  var weeks = [
    new Date("2017/9/5"),
    new Date("2017/9/12"),
    new Date("2017/9/19"),
    new Date("2017/9/24"),
    new Date("2017/10/1"),
    new Date("2017/10/8"),
    new Date("2017/10/15"),
    new Date("2017/10/22"),
    new Date("2017/10/28"),
    new Date("2017/11/4"),
    new Date("2017/11/11"),
    new Date("2017/11/18")
  ]

  this.getCurrentWeek = function(){
    console.log('getCurrentWeek')
    var rightNow = new Date()
    var currentWeek = 0

    for(var i=0; i<weeks.length; i++){
      if(weeks[i] > rightNow){
        currentWeek = i+1
        break;
      }
    }
    return currentWeek
  }

  this.getNow = function(){
    return new Date()
  }

  this.getCurrentWeekDate = function(){
    return weeks[this.getCurrentWeek()-1]
  }
})
