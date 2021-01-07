const router = require('express').Router()
const {User, Channel, Playlist, Timeslot, Segment, PlaylistItem, Program} = require('../db/models')
const turnOnChannelEmitter = require('../channelEmitter')
const {seedNext24HrTimeslots, seedNext2hrSegments} = require('../scheduleSeeders')
const { Op } = require("sequelize");

const {uploadProgram, uploadPlaylist} = require('./crudHelpers')

module.exports = router

router
.get('/', (req, res, next) => {
  var now = new Date().getTime()
  Channel.findAll({
    include: [
      {model: User}
    ],
    order: [['createdAt', 'ASC']],
    limit: 50
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(500).json(err)
  })
})

.post('/setdefsrc/:channelId', async (req, res, next) => {
  var channelId = req.params.channelId
  try{
    var channel = await Channel.findByPk(channelId)
    var program = await uploadProgram(req.body.defaultSrc)

    await channel.save()
    res.json({message: "default saved to channel"})

  }catch(err){
    res.status(500).json(err);
  }
})

.get('/timeslots', (req, res, next) => {
  var now = new Date().getTime()
  Channel.findAll({
    include: [
      {model: User},
      {model:Timeslot, include:{model:Program}, where:{endtime: {[Op.gt]: now}, starttime: {[Op.lt]: now+(1000*60*60*3)}}
      }
    ],
    order: [['createdAt', 'ASC'], [Timeslot, 'starttime', 'ASC']],
    limit: 50
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(500).json({error: err.message})
  })
})

.get('/:id', (req, res, next) => {
  Channel.findOne({
    where: {id: req.params.id},
    include: [{model: User}, {model:Program, as: 'defaultProgram'}],
  })
  .then((channel) => {
    res.status(200).json(channel)
  })
  .catch((err) => {
    res.status(500).json(err)
  })
})

.post('/', async (req, res, next) => {
  var {name, description, defaultVideoId, playlistId} = req.body

  if(name.length>7){
    return res.status(400).json(new Error("name length too long"))
  }else if(description.length>1000){
    return res.status(400).json(new Error("description length too long"))
  }else if(!name.match(/^\w+$/)){
    return res.status(400).json(new Error("channel name must be alphanumeric underscore characters only"))
  }

  var channels = await Channel.findAll({where:{userId:req.user.id}})
  // if(channels.length>=3){
  //   return res.status(500).json({err:"user can't create more than 3 channels"})
  // }

  try{
    var program = await uploadProgram(defaultVideoId, req.user)
    var playlist = await uploadPlaylist(playlistId, req.user)
    var channel = await Channel.create({name, description, userId:req.user.id})

    await channel.setDefaultProgram(program)
    await channel.setPlaylist(playlist)
    await seedNext24HrTimeslots(channel.id, true)

    channel = await Channel.findByPk(channel.id, {include:[{model:User}]})
    var io = req.app.locals.io
    turnOnChannelEmitter(channel, io)
    res.status(201).json(channel)
  } catch(err) {
    if(program){
      program.destroy()
    }
    if(channel){
      channel.destroy()
    }
    if(playlist){
      playlist.destroy()
    }
    res.status(500).json(err);
  }
})

.post('/playlist', async (req, res, next) => {
  var {channelId, playlistId} = req.body

  await Segment.destroy({where:{channelId}})
  await Timeslot.destroy({where:{channelId}})
  var channel = await Channel.findByPk(channelId)
  var playlist = await Playlist.findByPk(playlistId)
  await channel.setPlaylist(playlist)
  await seedNext24HrTimeslots(channelId, true)

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
    res.status(500).json(err);
  })
})
