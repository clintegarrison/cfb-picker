var app = angular.module("cfbPicker")

app.service('parlayService', function(){
    var parlays = []

    this.addParlay = function(parlay){
      parlays.push(parlay)
    }

    this.getParlays = function(){
      return parlays;
    }

    this.clearAllParlays = function(){
      parlays = []
    }

    this.deleteParlayPick = function(parlayPick){
      var index = parlays.indexOf(parlayPick)
      parlays.splice(index, 1)
    }
})
