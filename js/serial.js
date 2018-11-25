const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

module.exports = class Serial{
  constructor(){
    this.port
    this.portName
  }

  open(portName){
    this.portName = portName
    this.port = new SerialPort(`/${portName}`, { baudRate: 9600 })
  }

  close(){
    this.port.close()
  }

  checkForData(callback){
    const parser = this.port.pipe(new Readline({ delimiter: '\r\n' }))
    parser.on("data", async (data) =>{
      callback(data)
    })
  }

  async changeActiveSerialPort(newPort){
    if(this.portName != newPort){
      if(this.portName !== undefined && this.port.isOpen){
        this.close()
      }
      this.open(newPort)
      return Promise.resolve()
    }else{
      return Promise.reject("The port you're trying to set is already active")
    }
  }

  async getAvailablePorts(){
    return new Promise((resolve, reject) => {
      let array = []
      SerialPort.list((err, ports) => {
        ports.forEach((port) => {
          array.push(port.comName)
          resolve(array)
        })
      })
    })
  }
}
