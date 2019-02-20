const fs = require("fs")
const request = require("request")
const rp = require("request-promise-native")
const Cache = require('./cache')

module.exports = class SpotifyAPI{
  constructor(){
    this.cache = new Cache()

    this.client_id = process.env.CLIENT_ID
    this.client_secret = process.env.CLIENT_SECRET
    this.redirect_uri = "http://localhost:8888/callback"
    this.scope = "user-modify-playback-state%20user-read-playback-state"

    this.ref_token
    this.acc_token

    this.spotifyVolume

    this.user = ""

    this.generatedState = this.generateRandomString(16)
  }

  async init(){
    try{
      this.ref_token = await this.cache.getRefreshToken()
      await this.refreshToken()
    }catch(err){
      console.log(err)
    }

    try{
      this.spotifyVolume = await this.getVolume()
    }catch(err){
      console.log(err.statusCode)
    }

    try{
      this.user = await this.cache.getUser()
    }catch(err){
      console.log(err)
    }
  }

  generateRandomString(length) {
    let text = ""
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
  }

  authRedirect(req, res){
    res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${this.client_id}&scope=${this.scope}&redirect_uri=${this.redirect_uri}&state=${this.generatedState}`)
  }

  async authCallback(req, res, next){
    const code = req.query.code || null
    const state = req.query.state || null

    if (state === null || state !== this.generatedState) {
      console.log("States doesn't match")
    } else {
      const options = {
        url: "https://accounts.spotify.com/api/token",
        form: {
          code: code,
          redirect_uri: this.redirect_uri,
          grant_type: "authorization_code"
        },
        headers: {
          "Authorization": "Basic " + Buffer.from(this.client_id + ":" + this.client_secret).toString("base64")
        },
        json: true
      }

      try{
        var response = await rp.post(options)
        this.acc_token = response.access_token
        this.ref_token = response.refresh_token

        this.user = await this.getUser()
        this.spotifyVolume = await this.getVolume()

        await this.cache.setRefreshToken(this.ref_token)
        await this.cache.setUser(this.user)

        res.redirect("/")
      }catch(err){
        console.log("Couldn't retrieve tokens. Error: " + err.statusCode)
      }
    }
  }

  async getUser(){
    var options = {
      url: 'https://api.spotify.com/v1/me',
      headers: { 'Authorization': 'Bearer ' + this.acc_token },
      json: true
    }

    const response = await rp.get(options)

    return `${response.display_name} (${response.id})`
  }

  async refreshToken(){
    const options = {
      url: "https://accounts.spotify.com/api/token",
      headers: { "Authorization": "Basic " + Buffer.from(this.client_id + ":" + this.client_secret).toString("base64") },
      form: {
        grant_type: "refresh_token",
        refresh_token: this.ref_token
      },
      json: true
    }

    const response = await rp.post(options)
    this.acc_token = response.access_token
  }

  async setVolume(vol){
    console.log("Setting volume to: " + vol)

    var options = {
      url: "https://api.spotify.com/v1/me/player/volume?volume_percent=" + vol,
      headers: { "Authorization": "Bearer " + this.acc_token }
    }

    try{
      const response = await rp.put(options)
      return response
    }catch(err){
      if(err.statusCode == 401){
        await this.refreshToken()
        await this.setVolume(vol)
      }else{
        console.log(`setVolume() error: ${err.statusCode}`)
      }
      return
    }
  }

  async getVolume(){
    const options = {
      url: "https://api.spotify.com/v1/me/player",
      headers: { "Authorization": "Bearer " + this.acc_token },
      json: true
    }

    const response = await rp.get(options)
    return response.device.volume_percent
  }

  async lowerVolume(val){
    if(isNaN(this.spotifyVolume)){
      try{
        this.spotifyVolume = await this.getVolume()
      }catch(err){
        console.log(err.statusCode)
      }
    }
    if(this.spotifyVolume != 0){
      if(this.spotifyVolume < val){
        this.spotifyVolume = 0
      }else{
        this.spotifyVolume -= val
      }
      await this.setVolume(this.spotifyVolume)
    }else{
      return
    }
  }

  async increaseVolume(val){
    if(isNaN(this.spotifyVolume)){
      try{
        this.spotifyVolume = await this.getVolume()
      }catch(err){
        console.log(err.statusCode)
      }
    }
    if(this.spotifyVolume != 100){
      if(this.spotifyVolume > 100 - val){
        this.spotifyVolume = 100
      }else{
        this.spotifyVolume += val
      }
      await this.setVolume(this.spotifyVolume)
    }else{
      return
    }
  }
}
