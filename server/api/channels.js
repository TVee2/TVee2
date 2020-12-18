const router = require('express').Router()
const {User, Channel, Playlist, Timeslot, Segment, PlaylistItem, Program} = require('../db/models')
const turnOnChannelEmitter = require('../channelEmitter')
const {seedNext24HrTimeslots, seedNext2hrSegments} = require('../scheduleSeeders')

module.exports = router

router
.get('/', (req, res, next) => {
  Channel.findAll({
    include: {model: User},
    order: [['createdAt', 'ASC']],
    limit: 50
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.get('/:id', (req, res, next) => {
  Channel.findOne({
    where: {id: req.params.id},
    include: {model: User},
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.post('/', (req, res, next) => {
  Channel.findAll({where:{userId:req.user.id}})
  .then((channels)=>{ 
    if(channels.length>=3){
      res.json({err:"user can't create more than 3 channels"})
    }else{
      const user = req.user
      Channel.create(req.body)
      .then((channel) => User.findOne({where: {id: user.id}})
        .then((user) => channel.setUser(user))
      )
      .then((channel) => {
        Channel.findByPk(channel.id, {include:[{model:User}]})
        .then((channel)=>{
          //turn on channel emitter
          var io = req.app.locals.io
          turnOnChannelEmitter(channel, io)
          res.status(201).json(channel)
        })
      })
      .catch((err) => {
        res.status(400).json({error: err.message})
      })
    }
  })
})


.post('/playlist', async (req, res, next) => {
  var {channelId, playlistId} = req.body

  //reset all channel related stuff
  await Segment.destroy({where:{channelId}})
  await Timeslot.destroy({where:{channelId}})
  var channel = await Channel.findByPk(channelId)
  var playlist = await Playlist.findByPk(playlistId)
  await channel.setPlaylist(playlist)
  seedNext24HrTimeslots(channelId, true)

  res.json({message: "initialized channel"})
})

.delete('/:id', (req, res, next) => {
  Channel.findOne({
    where: {id: req.params.id}
  })
  .then((channel) => {
    if (channel) {
      return channel.destroy()
    } else {
      throw new Error('No channel found with matching id.')
    }
  })
  .then((channels) => {
    res.status(202).json(channels)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})
