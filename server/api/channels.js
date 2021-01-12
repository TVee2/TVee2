const router = require('express').Router()
const {User, Channel, Playlist, Timeslot, Segment, PlaylistItem, Program, Hashtag} = require('../db/models')
const turnOnChannelEmitter = require('../channelEmitter')
const {seedNext24HrTimeslots, seedNext2hrSegments} = require('../scheduleSeeders')
const { Op } = require("sequelize");
const roomVisitors = require('../socket/index.js').roomVisitors()

const {uploadProgram, uploadPlaylist} = require('./crudHelpers')

module.exports = router

var get10MostActiveChannels = () => {
  var arr = []
  for (const [key, value] of Object.entries(roomVisitors)) {
    arr.push({id:key, viewers:value.length})
  }
  arr.sort((a,b) => {
    return b.viewers - a.viewers
  })
  return arr.slice(0, 10).map((item) => item.id)
}

router
.get('/', (req, res, next) => {
  Channel.findAll({
    include: [
      {model: User},
      {model: Playlist},
      {model: Program, as: "defaultProgram"},
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

.get('/editable', (req, res, next) => {
  Channel.findAll({
    where:{userId:req.user.id},
    include: [
      {model: User},
      {model: Playlist},
      {model: Program, as: "defaultProgram"},
    ],
    order: [['createdAt', 'ASC']]
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(500).json(err)
  })
})

.post('/favorites/:id', (req, res, next) => {
  Channel.findOne({
    where: {id: req.params.id},
  })
  .then((channel) => {
    return req.user.addFavoriteChannel(channel)
  })
  .then(() => {
    res.status(200).json({message:"added to favorites"})
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

.post('/', async (req, res, next) => {
  var {name, description, defaultVideoId, playlistId, hashtags} = req.body

  if(name.length>7){
    return res.status(400).json(new Error("name length too long"))
  }else if(description.length>1000){
    return res.status(400).json(new Error("description length too long"))
  }else if(!name.match(/^\w+$/)){
    return res.status(400).json(new Error("channel name must be alphanumeric underscore characters only"))
  }

  // var channels = await Channel.findAll({where:{userId:req.user.id}})
  // if(channels.length>=3){
  //   return res.status(500).json({err:"user can't create more than 3 channels"})
  // }
  hashtags=['testhashtag1', 'testhashtag2', 'testhashtag3']
  try{
    var hashobj = hashtags.map((htag) => {return {tag:htag}})
    var playlist = await uploadPlaylist(playlistId, req.user)
    var channel = await Channel.create({name, description, Hashtags: [hashobj]})
    await req.user.addCreatedChannel(channel)
    if(defaultVideoId){
      var program = await uploadProgram(defaultVideoId, req.user)
      await channel.setDefaultProgram(program)
    }

    await channel.setPlaylist(playlist)
    await seedNext24HrTimeslots(channel.id, true)

    channel = await Channel.findByPk(channel.id, {include:[{model:User}]})
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
    res.status(500).json({err:err.message});
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
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(500).json(err);
  })
})

.get('/new', (req, res, next) => {
  //get channels by created at descending, maybe that have been around for at least a day
  Channel.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(500).json(err);
  })
})

.get('/related', (req, res, next) => {
  //more you might like, if favorites
  //most active/popular if no favorites
  //get channels with related or matching hashtags to your favorites
  //provided 4 hashtags, return ten channels with either same/fuzzy matched hashtags

  Channel.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(500).json(err);
  })
})

.get('/active', (req, res, next) => {
  //get channels with most visitors currently
  var channelIds = get10MostActiveChannels()
  Channel.findAll({
    where: {id: {[Op.in]: channelIds}},
    order: [['createdAt', 'DESC']],
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(500).json(err);
  })
})

.get('/favorites', (req, res, next) => {
  //get channels that user has starred
  // console.log(Object.keys(req.user.__proto__));
  req.user.getFavoriteChannels()
  .then(channels => {
    console.log(channels)
    res.status(200).json(channels)
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.get('/:id', (req, res, next) => {
  var numViewers = roomVisitors[req.params.id]?(roomVisitors[req.params.id].length+1):1
  Channel.findOne({
    where: {id: req.params.id},
    include: [{model: User}, {model:Program, as: 'defaultProgram'}],
  })
  .then((channel) => {
    res.status(200).json({channel, numViewers})
  })
  .catch((err) => {
    res.status(500).json(err)
  })
})
