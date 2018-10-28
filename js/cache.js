const fs = require("fs")

module.exports = class Cache{

  createCache(){
    const content = {refresh_token: "", user: "", serial_port: ""}
    const contentJSON = JSON.stringify(content)
    fs.writeFile("./cache", contentJSON, function(err){})
  }

  setSerialPort(port) {
    return new Promise((resolve, reject) => {
      fs.readFile('./cache', 'utf-8', function(err, data){
        let json = JSON.parse(data)

        json.serial_port = port

        json = JSON.stringify(json)

        fs.writeFile('./cache', json, 'utf-8', function (err) {
          resolve()
        })
      })
    })
  }

  setUser(user) {
    return new Promise((resolve, reject) => {
      fs.readFile('./cache', 'utf-8', function(err, data){
        let json = JSON.parse(data)

        json.user = user

        json = JSON.stringify(json)

        fs.writeFile('./cache', json, 'utf-8', function (err) {
          resolve()
        })
      })
    })
  }

  setRefreshToken(token) {
    return new Promise((resolve, reject) => {
      fs.readFile('./cache', 'utf-8', function(err, data){
        let json = JSON.parse(data)

        json.refresh_token = token

        json = JSON.stringify(json)

        fs.writeFile('./cache', json, 'utf-8', function (err) {
          resolve()
        })
      })
    })
  }

  getSerialPort(){
    return new Promise((resolve, reject) => {
      fs.readFile('./cache', 'utf-8', function(err, data){
        let json = JSON.parse(data)

        if(json.serial_port == ""){
          reject("Serial port not defined")
        }else{
          resolve(json.serial_port)
        }
      })
    })
  }

  getUser(){
    return new Promise((resolve, reject) => {
      fs.readFile('./cache', 'utf-8', function(err, data){
        if (err) throw err

        let json = JSON.parse(data)

        if(json.user == ""){
          reject("No account added")
        }else{
          resolve(json.user)
        }
      })
    })
  }

  getRefreshToken(){
    return new Promise((resolve, reject) => {
      fs.readFile("./cache", "utf8", (err, data) => {
        const json = JSON.parse(data)

        if(json.refresh_token == ""){
          reject("No refresh token defined")
        }else{
          resolve(json.refresh_token)
        }
      })
    })
  }
}
