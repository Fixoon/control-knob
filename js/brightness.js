const ddcci = require("@hensm/ddcci")

module.exports = class Brightness{
  constructor(){
    this.monitors = ddcci.getMonitorList()
  }

  increaseBrightness(val){
    let brightness = ddcci.getBrightness(this.monitors[0])
    if(brightness != 100){
      if(brightness > 100 - val){
        brightness= 100
      }else{
        brightness += val
      }
      this.setAllMonitorsBrightness(brightness)
    }else{
      return
    }
  }

  lowerBrightness(val){
    let brightness = ddcci.getBrightness(this.monitors[0])
    if(brightness != 0){
      if(brightness < val){
        brightness = 0
      }else{
        brightness -= val
      }
      this.setAllMonitorsBrightness(brightness)
    }else{
      return
    }
  }

  setAllMonitorsBrightness(val){
    for(const monitor of this.monitors){
      ddcci.setBrightness(monitor, val)
    }
  }
}
