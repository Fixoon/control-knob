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
    const currentTime = this.getTime()
    let newBrightness = null
    let latestTime = 0

    for(let i = 0; i < this.times.length; i++){
      const time = this.times[i]
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
    const currentTime = this.getTime()

    for(let i = 0; i < this.times.length; i++){
      if(this.times[i] == currentTime){
        this.brightness.setAllMonitorsBrightness(this.values[i])
      }
    }

    setTimeout(() => this.checkForCommands(), 60000);
  }

  getTime(){
    const date = new Date()
    let minutes = 0

    if(date.getMinutes() < 10){
      minutes = "0" + date.getMinutes()
    }else{
      minutes = date.getMinutes()
    }

    const formattedDate = `${date.getHours()}${minutes}`
    return Number(formattedDate)
  }
}
