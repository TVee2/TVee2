var channels = require("./channelSeed.js")
var {buildPlaylistFromId} = require("../server/api/crudHelpers")
const {User} = require('../server/db/models')
require('dotenv').config()

var i = 0;
(async () => {
  var user = await User.findOne({where:{email:"admin@tvee2.com"}})
  while(i<channels.length){
    await buildPlaylistFromId(channels[i].name, null, null, channels[i].playlistId, channels[i].channelId, [], user)
    i++;
  }
  console.log("script finish")
})().catch((err)=>{console.log(err)})
