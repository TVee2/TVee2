var CronJob = require('cron').CronJob
const {User, Segment, Schedule, Program, Channel, Timeslot, Playlist, PlaylistItem} = require('../db/models')
const {Op} = require('sequelize')

const turnOnChannelEmitter = require('../channelEmitter')
const {seedNext24HrTimeslots, seedNext2hrSegments} = require('../scheduleSeeders')

var seedAllChannels = async ()=>{
  var channels = await Channel.findAll()
  
  channels.forEach((channel)=>{ 
    seedNext24HrTimeslots(channel.id, true)
  })
}

module.exports = io => {
  //any time we re initialize, seed segments
  seedAllChannels()
  new CronJob(
  '0 0 * * * *',
  seedNext2hrSegments,
  null,
  true,
  'America/Chicago'
  )

  new CronJob(
  '0 20 * * * *',
  seedAllChannels,
  null,
  true,
  'America/Chicago'
  )

  new CronJob(
  '0 23 * * * *',
  () => {
    console.log("daily destroy previous segments")
    Segment.destroy({where: {time:{[Op.lt]:Math.floor((new Date().getTime())/1000)}}})
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
