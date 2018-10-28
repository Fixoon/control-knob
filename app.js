const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const Spotify = require('./js/spotify')
const Serial = require('./js/serial')
const Brightness = require('./js/brightness')
const Cache = require('./js/cache')
const path = require('path')


class main{
  constructor(){
    this.spotify = new Spotify()
    this.serial = new Serial()
    this.brightness = new Brightness()
    this.cache = new Cache()

    this.app = express()

    this.buttonState = 0

    this.init()
  }

  async init(){
    if(fs.existsSync("cache")){
      try{
        const portName = await this.cache.getSerialPort()
        this.serial.open(portName)
        this.serial.checkForData(this.serialCallback.bind(this))
      }catch(err){
        console.log(err)
      }

      await this.spotify.init()
    }else{
      this.cache.createCache()
    }
    await this.initExpress()
  }

  async initExpress(){
    const serialPorts = await this.serial.getAvailablePorts()

    const app = express()
    this.app.engine('pug', require('pug').__express)
    this.app.set('views', path.join(__dirname, 'views'))
    this.app.set("view engine", "pug")
    this.app.use(bodyParser.urlencoded({ extended: true }))

    this.app.get('/', (req, res) => {
      res.render('index', { user: this.spotify.user , serialPorts: serialPorts, serialPort: this.serial.portName})
    })

    this.app.get("/login", this.spotify.authRedirect.bind(this.spotify))

    this.app.get("/callback", this.spotify.authCallback.bind(this.spotify))

    this.app.post('/com', async (req, res) => {
      try{
        await this.serial.changeActiveSerialPort(req.body.portSelect)
        this.serial.checkForData(this.serialCallback.bind(this))
      }catch(err){
        console.log(err)
      }

      this.cache.setSerialPort(req.body.portSelect)

      res.redirect("/")
    })

    this.app.listen(8888)
  }

  serialCallback(data){
    if(data == "0D"){
      if(this.buttonState == 0){
        this.buttonState = 1
      }else{
        this.buttonState = 0
      }
    }
    if(data == "0R"){
      if(this.buttonState == 0){
        this.spotify.increaseVolume(5)
      }else{
        this.brightness.increaseBrightness(10)
      }
    }
    if(data == "0L"){
      if(this.buttonState == 0){
        this.spotify.lowerVolume(5)
      }else{
        this.brightness.lowerBrightness(10)
      }
    }
  }
}

new main()
