const Brightness = require('./brightness')
const Cache = require('./cache')

module.exports = class Schedule{
  constructor(){
    this.brightness = new Brightness()
    this.cache = new Cache()

    this.times = []
    this.values = []
    this.timeStamps = []
  }

  async init(){
    this.times = (await this.cache.getCommands())[0]
    this.values = (await this.cache.getCommands())[1]
    this.timeStamps = (await this.cache.getCommands())[2]
    this.checkForPreviousCommands()
    this.checkForCommands()
  }

  addNewCommand(time, value, timeStamp){
    this.times.push(time)
    this.values.push(value)
    this.timeStamps.push(timeStamp)

    this.cache.setCommands([this.times, this.values, this.timeStamps])
  }

  removeCommand(index){
    this.times.splice(index, 1)
    this.values.splice(index, 1)
    this.timeStamps.splice(index, 1)

    this.cache.setCommands([this.times, this.values, this.timeStamps])
  }

  checkForPreviousCommands(){
    var currentTime = this.getTime()
    var newBrightness = null
    var latestTime = 0

    for(var i = 0; i < this.times.length; i++){
      var time = this.times[i]
      if(time < currentTime){
        if(time > latestTime){
          latestTime = time
          newBrightness = this.values[i]
        }
      }
      if(i == this.times.length-1 && newBrightness != null){
        this.brightness.setAllMonitorsBrightness(newBrightness)
      }
    }
  }

  checkForCommands(){
    var currentTime = this.getTime()

    for(var i = 0; i < this.times.length; i++){
      if(this.times[i] == currentTime){
        this.brightness.setAllMonitorsBrightness(this.values[i])
      }
    }

    setTimeout(() => this.checkForCommands(), 60000);
  }

  getTime(){
    var date = new Date()
    var minutes = 0
    if(date.getMinutes() < 10){
      minutes = "0" + date.getMinutes()
    }else{
      minutes = date.getMinutes()
    }
    var formattedDate = `${date.getHours()}${minutes}`
    return Number(formattedDate)
  }
}
