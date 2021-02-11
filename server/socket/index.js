var CronJob = require('cron').CronJob

const {User, Segment, Schedule, Program, Channel, Timeslot, Playlist, PlaylistItem, ChannelVisitLog} = require('../db/models')
const {Op} = require('sequelize')

const { turnOnChannelEmitter } = require('../channelEmitter')
const {seedNext24HrTimeslots, seedNext2hrSegments, verifyAndUpdatePlaylists, updateChannelPlaylists} = require('../scheduleSeeders')
const {uploadOrUpdatePlaylist, uploadOrUpdateChannelPlaylist} = require('../api/crudHelpers')
const seedDurationLimit = process.env.SEED_DURATION_LIMIT

objIO = {}
module.exports.objIO = objIO

var seedAllChannels = async ()=>{
  var channels = await Channel.findAll()
  
  channels.forEach((channel)=>{ 
    seedNext24HrTimeslots(channel.id, true)
  })
}

const visitorChannelDirectory = {}
const roomVisitors = {}
module.exports.roomVisitors = () => {
  return roomVisitors
}

module.exports.startSeeding = io => {
  objIO.io = io
  io.on('connection', socket => {
    socket.on('roomenter', (data) => {
      //data should maybe be room enter, room leave
      var channelId = data.channelId
      visitorChannelDirectory[socket.id] = {createdAt:new Date().getTime(), channelId: channelId}
      roomVisitors[channelId]?roomVisitors[channelId].push(socket.id):roomVisitors[channelId]=[socket.id]
      ChannelVisitLog.create({socketId:socket.id, channelId:channelId, enterChannel: new Date().getTime()})
    })

    socket.on('roomleave', (data) => {
      //data should maybe be room enter, room leave
      var channelId = data.channelId
      if(!roomVisitors[channelId]){
        return
      }
      roomVisitors[channelId].splice(roomVisitors[channelId].indexOf(socket.id), 1)
      ChannelVisitLog.findAll({where: {socketId:socket.id, channelId:channelId}, limit:1, order:[["createdAt", "DESC"]]})
      .then((logs) => {
        if(logs.length == 1){
          var log = logs[0]
          log.leaveChannel = new Date().getTime()
          log.save()
        }
      })
    })
    
    socket.on('disconnect', (data) => {
      var channelId = visitorChannelDirectory[socket.id]?visitorChannelDirectory[socket.id].channelId:null
      if(channelId){
        roomVisitors[channelId].splice(roomVisitors[channelId].indexOf(socket.id), 1)
        ChannelVisitLog.findAll({where: {socketId:socket.id, channelId:channelId}, limit:1, order:[["createdAt", "DESC"]]})
        .then((logs) => {
          if(logs.length == 1){
            var log = logs[0]
            log.leaveChannel = new Date().getTime()
            log.save()
          }
        })
      }
    })
  })

  new CronJob(
  '0 * * * *',
  () => {
    var now = new Date().getTime()
    for (const [key, value] of Object.entries(visitorChannelDirectory)) {
      if(value.createdAt < now - (1000*60*60*24)){
        delete visitorChannelDirectory[key]
      }
    }
  },
  null,
  true,
  'America/Chicago'
  )

  //any time we reinitialize, seed segments
  seedAllChannels()

  new CronJob(
  '0 * * * *',
  seedNext2hrSegments,
  null,
  true,
  'America/Chicago'
  )

  new CronJob(
  '0 19 * * *',
  updateChannelPlaylists,
  null,
  true,
  'America/Chicago'
  )

  new CronJob(
  '0 20 * * *',
  seedAllChannels,
  null,
  true,
  'America/Chicago'
  )

  new CronJob(
  '0 * * * *',
  () => {
    console.log("deleting previous segments")
    Segment.destroy({where: {time:{[Op.lt]:Math.floor((new Date().getTime())/1000)}}})
    console.log("deleting previous timeslots")
    Timeslot.destroy({where: {endtime:{[Op.lt]:Math.floor((new Date().getTime())/1000)}}})
  },
  null,
  true,
  'America/Chicago'
  )

  Channel.findAll()
  .then((channels) => {
    channels.map((channel) => {
      turnOnChannelEmitter(channel, io)
    })
  })
}
