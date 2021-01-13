const router = require('express').Router()
const {User, Channel, Playlist, Timeslot, Segment, PlaylistItem, Program, Hashtag} = require('../db/models')
const db = require('../db')
const turnOnChannelEmitter = require('../channelEmitter')
const {seedNext24HrTimeslots, seedNext2hrSegments} = require('../scheduleSeeders')
const {Op} = require("sequelize");
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

function getRandomNoItemsFromArr(arr, n) {
  var i = n
  var items = arr
  var len = items.length
  var result = []
  var rand = null
  while (i && items.length) {
    rand = Math.floor(Math.random() * len)
    result.push(items[rand])
    items.splice(rand, 1)
    len=items.length
    i--
  }
  return result
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
    console.log(err)
    res.status(500).json(err);
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
    console.log(err)
    res.status(500).json(err);
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
    console.log(err)
    res.status(500).json(err);
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
    console.log(err)
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
    console.log(err)
    res.status(500).json(err);
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

  var channels = await Channel.findAll({where:{userId:req.user.id}})
  if(channels.length>=9){
    return res.status(500).json({err:"user can't create more than 9 channels currently, delete an existing. for exceptions contact site"})
  }

  try{
    var hasharr = hashtags.map((htag) => {return {tag:htag}})
    var playlist = await uploadPlaylist(playlistId, req.user)
    var hashtags = await Promise.all(hasharr.map((h)=>Hashtag.findOrCreate({where:h}).then((arr)=>arr[0])))
    var channel = await Channel.create({name, description})
    await channel.setHashtags(hashtags)
    await req.user.addCreatedChannel(channel)
    if(defaultVideoId){
      var program = await uploadProgram(defaultVideoId, req.user)
      await channel.setDefaultProgram(program)
    }

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
    console.log(err)
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
    res.status(200).json(channels)
  })
  .catch((err) => {
    console.log(err)
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
    console.log(err)
    res.status(500).json(err);
  })
})

.get('/related/favorites', (req, res, next) => {
  //
  //related to favorites, more you might like
  //
  req.user.getFavoriteChannels()
  .then((favorites) => {
    var favs1 = getRandomNoItemsFromArr(favorites, 1)
    favs1[0].getHashtags()
  })
  .then((hashtags) => {
    hashtags = hashtags.map((hashtag)=>{return hashtag.tag})
    var str = hashtags.join(',')
    var list = "('"+hashtags+"')"
    list = list.replace(/,/g, "\',\'")
    return db.query(`SELECT DISTINCT channels.id, channels.\"name\", channels.\"defaultProgramId\" FROM channels JOIN channelhashtags ON channels.id = channelhashtags.\"channelId\" JOIN hashtags on hashtags.id = channelhashtags.\"hashtagId\" WHERE tag IN ${list} AND NOT channelhashtags.\"channelId\" = ${req.params.id}`, { type: QueryTypes.SELECT })
  })
  .then((channels) => {
    var related10 = getRandomNoItemsFromArr(channels, 10)
    res.status(200).json(channels)
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.get('/related/tag/:tagstring', (req, res, next) => {
  const { QueryTypes } = require('sequelize');
  // //
  // //channels that have hash tag
  // //
  var list = "('"+req.params.tagstring+"')"
  list = list.replace(/,/g, "\',\'")
  db.query(`SELECT DISTINCT channels.id, channels.\"name\", channels.\"defaultProgramId\" FROM channels JOIN channelhashtags ON channels.id = channelhashtags.\"channelId\" JOIN hashtags on hashtags.id = channelhashtags.\"hashtagId\" WHERE tag IN ${list} AND NOT channelhashtags.\"channelId\" = ${req.params.id}`, { type: QueryTypes.SELECT })
  .then((channels)=>{
    var related10 = getRandomNoItemsFromArr(channels, 10)
    res.json(related10)
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.get('/related/:id', (req, res, next) => {
  const { QueryTypes } = require('sequelize');
  // //
  // //related to single video
  // //
  Channel.findByPk(req.params.id)
  .then((channel) => {
    return channel.getHashtags()
  })
  .then((hashtags) => {
    hashtags = hashtags.map((hashtag)=>{return hashtag.tag})
    var str = hashtags.join(',')
    var list = "('"+hashtags+"')"
    list = list.replace(/,/g, "\',\'")
    db.query(`SELECT DISTINCT channels.id, channels.\"name\", channels.\"defaultProgramId\" FROM channels JOIN channelhashtags ON channels.id = channelhashtags.\"channelId\" JOIN hashtags on hashtags.id = channelhashtags.\"hashtagId\" WHERE tag IN ${list} AND NOT channelhashtags.\"channelId\" = ${req.params.id}`, { type: QueryTypes.SELECT })
    .then((channels)=>{
      var related10 = getRandomNoItemsFromArr(channels, 10)
      res.json(related10)
    })
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})


.get('/active', (req, res, next) => {
  // //
  // //get channels with most visitors currently
  // //
  var channelIds = get10MostActiveChannels()
  Channel.findAll({
    where: {id: {[Op.in]: channelIds}},
    order: [['createdAt', 'DESC']],
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.get('/favorites', (req, res, next) => {
  // //
  // //get channels that user has starred
  // //
  req.user.getFavoriteChannels()
  .then(channels => {
    var related10 = getRandomNoItemsFromArr(channels, 10)
    res.status(200).json(channels)
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.get('/:id', (req, res, next) => {
  // //
  // //get single channel
  // //
  var numViewers = roomVisitors[req.params.id]?(roomVisitors[req.params.id].length+1):1
  Channel.findOne({
    where: {id: req.params.id},
    include: [{model: User}, {model:Program, as: 'defaultProgram'}],
  })
  .then((channel) => {
    res.status(200).json({channel, numViewers})
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})
