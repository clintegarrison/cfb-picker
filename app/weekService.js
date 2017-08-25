var app = angular.module("cfbPicker")

app.service('weekService', function(){

  var weeks = [
    new Date("2017/9/5"),
    new Date("2017/9/12"),
    new Date("2017/9/19"),
    new Date("2017/9/26"),
    new Date("2017/10/3"),
    new Date("2017/10/10"),
    new Date("2017/10/17"),
    new Date("2017/10/24"),
    new Date("2017/10/30"),
    new Date("2017/11/6"),
    new Date("2017/11/13"),
    new Date("2017/11/20")
  ]

  this.getCurrentWeek = function(){
    console.log('getCurrentWeek')
    var rightNow = new Date()
    var currentWeek = 0

    for(var i=0; i<weeks.length; i++){
      if(weeks[0] > rightNow){
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
