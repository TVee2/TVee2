var channels = require("./channelSeed.js")
var {buildPlaylistFromId} = require("../server/api/crudHelpers")
const {User, Channel} = require('../server/db/models')
require('dotenv').config()

var i = 0;
(async () => {
  var user = await User.findOne({where:{email:"admin@tvee2.com"}})
  while(i<channels.length){
    var channel = await Channel.findOne({where:{name:channels[i].name}})
    if(channel){
      console.log("skipping", channel.name, "already created")
    }
    if(!channel){
      await buildPlaylistFromId(channels[i].name, null, null, channels[i].playlistId, channels[i].channelId, [], user)
    }
    i++;
  }
  console.log("script finish")
})().catch((err)=>{console.log(err)})
