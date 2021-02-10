const router = require('express').Router()
const {User, Channel, Playlist, Timeslot, Segment, PlaylistItem, Program, Hashtag, Pix} = require('../db/models')
const db = require('../db')
const { turnOnChannelEmitter, turnOffChannelEmitter } = require('../channelEmitter')
const {seedNext24HrTimeslots, seedNext2hrSegments} = require('../scheduleSeeders')
const {Op} = require("sequelize");
const roomVisitors = require('../socket/index.js').roomVisitors()

const {uploadProgram, uploadOrUpdatePlaylist, uploadOrUpdateChannelPlaylist} = require('./crudHelpers')
var channelUploadLimit = process.env.CHANNEL_UPLOAD_LIMIT
const seedDurationLimit = process.env.SEED_DURATION_LIMIT

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
      {model: Hashtag},
      {model: Playlist},
      {model: Program, as: "defaultProgram"},
    ],
    where:{active:true},
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

.get('/all', (req, res, next)=>{
  Channel.findAll({
    order: [['createdAt', 'DESC']],
  })
  .then((items)=>{
    res.status(200).json(items)
  })
})

.get('/page/:page', (req, res, next) => {
  let limit = 10
  let offset = 0
  var now = new Date().getTime()
  Channel.findAndCountAll({
    distinct:true, 
    where:{active:true},
    order: [['id', 'ASC'], [Timeslot, 'starttime', 'ASC']],
    include: {model:Timeslot, include:{model:Program}, where:{endtime: {[Op.gt]: now}, starttime: {[Op.lt]: now+(1000*60*60*3)}}},
  }).then(data => {
    let page = req.params.page
    let pages = Math.ceil(data.count / limit)
    offset = limit * (page - 1)
    Channel.findAll({
      where:{active:true},
      order: [['id', 'ASC'], [Timeslot, 'starttime', 'ASC']],
      include: {model:Timeslot, include:{model:Program}, where:{endtime: {[Op.gt]: now}, starttime: {[Op.lt]: now+(1000*60*60*3)}}},
      limit: limit,
      offset: offset,
    })
    .then(channels => {
      res
        .status(200)
        .json({
          result: channels,
          count: data.count,
          limit: channels.length,
          page: Number(req.params.page),
          pages: pages
        })
    })
    .catch(err => {
      console.log(err)
      res.status(500).send(err)
    })
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

.post('/favorites/remove/:id', (req, res, next) => {
  Channel.findOne({
    where: {id: req.params.id},
  })
  .then((channel) => {
    return req.user.removeFavoriteChannel(channel)
  })
  .then(() => {
    res.status(200).json({message:"removed from favorites"})
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.post('/favorites/add/:id', (req, res, next) => {
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
  var {name, description, defaultVideoId, playlistId, youtubeChannelId, hashtags} = req.body

  if(name.length>15){
    return res.status(400).json(new Error("name length too long"))
  }else if(description.length>1000){
    return res.status(400).json(new Error("description length too long"))
  }else if(!name.match(/^\w+$/)){
    return res.status(400).json(new Error("channel name must be alphanumeric underscore characters only"))
  }

  var channels = await Channel.findAll({where:{userId:req.user.id}})
  var uploadLimit = channelUploadLimit || 3
  try{
    if(channels.length>=uploadLimit){
      throw Error(`User can't create more than ${channelUploadLimit || 3} channels currently while youtube api requests are limited, delete an existing channel. For exceptions contact admin@tvee2.com`)
    }
    var playlist
    if(youtubeChannelId){
      console.log("at upload channel")
      playlist = await uploadOrUpdateChannelPlaylist(youtubeChannelId, null, req.user, seedDurationLimit || 4*60*60)
    }else if(playlistId){
      playlist = await uploadOrUpdatePlaylist(playlistId, null, req.user)
    }
    if(!playlist){
      throw Error("Youtube playlist id or youtube channel id must be provided")
    }
    var channel = await Channel.create({name, description, thumbnailUrl:playlist.thumbnailUrl, userId:req.user.id})
    var hashtags = hashtags.filter((h) => h)
    if(hashtags.some((h)=>{return h.length>15})){
      return res.status(400).json(new Error("Hashtags must not be greater than 15 chars"))
    }
    if(hashtags.length){
      var hasharr = hashtags.map((htag) => {return {tag:htag}})
      var hashtags = await Promise.all(hasharr.map((h)=>Hashtag.findOrCreate({where:h}).then((arr)=>arr[0])))
      await channel.setHashtags(hashtags)
    }
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

    res.status(500).json({message:err.message});
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

.post('/refreshandreseed', async (req, res, next) => {
  var {channelId} = req.body
  await Segment.destroy({where:{channelId}})
  await Timeslot.destroy({where:{channelId}})
  await seedNext24HrTimeslots(channelId, true)
  res.json({message: "channel refreshed"})
})

.get('/new', (req, res, next) => {
  //get channels by created at descending, maybe that have been around for at least a day
  Channel.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
  })
  .then((channels) => {
    var related10 = getRandomNoItemsFromArr(channels, 5)
    res.status(200).json(related10)
    return
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.get('/related/favorites', (req, res, next) => {
  const { QueryTypes } = require('sequelize');
  //
  //related to favorites, more you might like
  //
  var fav = null
  if(!req.user){
    res.json({})
  }else{
    req.user.getFavoriteChannels()
    .then((favorites) => {
      if(!favorites.length){
        return Promise.reject([])
      }
      var favs1 = getRandomNoItemsFromArr(favorites, 1)
      fav = favs1[0]
      return favs1[0].getHashtags()
    })
    .then((hashtags) => {
      if(!hashtags.length){
        return Promise.reject([])
      }
      hashtags = hashtags.map((hashtag)=>{return hashtag.tag})
      var str = hashtags.join(',')
      var list = "('"+hashtags+"')"
      list = list.replace(/,/g, "\',\'")

      return db.query(`SELECT DISTINCT channels.id, channels.\"name\", channels.\"thumbnailUrl\", channels.\"defaultProgramId\" FROM channels JOIN channelhashtags ON channels.id = channelhashtags.\"channelId\" JOIN hashtags on hashtags.id = channelhashtags.\"hashtagId\" WHERE tag IN ${list} AND NOT channelhashtags.\"channelId\" = ${fav.id}`, { type: QueryTypes.SELECT })
    })
    .then((channels) => {
      var related10 = getRandomNoItemsFromArr(channels, 5)
      res.status(200).json(related10)
      return
    })
    .catch((err) => {
      if(err.length==0){
        res.json(err)
      }else{
        console.log(err)
        res.status(500).json(err);
      }
    })
  }
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
    db.query(`SELECT DISTINCT channels.id, channels.\"name\", channels.\"thumbnailUrl\", channels.\"defaultProgramId\" FROM channels JOIN channelhashtags ON channels.id = channelhashtags.\"channelId\" JOIN hashtags on hashtags.id = channelhashtags.\"hashtagId\" WHERE tag IN ${list} AND NOT channelhashtags.\"channelId\" = ${req.params.id}`, { type: QueryTypes.SELECT })
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
    var related10 = getRandomNoItemsFromArr(channels, 10)
    res.status(200).json(related10)
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.get('/favorites/nonrandom', (req, res, next) => {
  // //
  // //get favorites not random return
  // //
  if(!req.user){
    res.json({})
  }else{
    req.user.getFavoriteChannels({
      order: [['id', 'ASC']]
    })
    .then((channels) => {
      res.status(200).json(channels)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json(err);
    })
  }
})

.get('/favorites', (req, res, next) => {
  // //
  // //get channels that user has starred
  // //
  if(!req.user){
    res.json({})
  }else{
    req.user.getFavoriteChannels()
    .then(channels => {
      // console.log(channels)
      var related10 = getRandomNoItemsFromArr(channels, 10)
      res.status(200).json(related10)
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json(err);
    })
  }
})

.get('/isfavorite/:id', (req, res, next) => {
  // //
  // //get channels that user has starred
  // //
  if(!req.user){
    res.json({})
  }else{
    req.user.getFavoriteChannels()
    .then(favorites => {
      Channel.findByPk(req.params.id)
      .then((channel) => {
        var isFavorite = false
        if(channel){
          isFavorite = favorites.some((favorite) => {return favorite.id === channel.id})
        }
        return res.status(200).json({isFavorite})
      })
    })
    .catch((err) => {
      console.log(err)
      res.status(500).json(err);
    })
  }
})

.get('/:id', (req, res, next) => {
  // //
  // //get single channel
  // //
  var numViewers = roomVisitors[req.params.id]?(roomVisitors[req.params.id].length+1):1
  Channel.findOne({
    where: {id: req.params.id},
    include: [{model: User, include:[{model:Pix, as:'profilePix'}]}, {model:Hashtag}, {model:Playlist}, {model:Program, as: 'defaultProgram'}],
  })
  .then((channel) => {
    res.status(200).json({channel, numViewers})
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.put('/:id', async (req, res, next) => {
  // //
  // //edit single channel
  // //
  var hashtags = req.body.hashtags 
  if(hashtags){
    hashtags = req.body.hashtags.filter((h) => h)
    if(hashtags.some((h)=>{return h.length>15})){
      return res.status(400).json(new Error("hashtag greater than 15 chars"))
    }
    if(hashtags.length){
      var hasharr = hashtags.map((htag) => {return {tag:htag}})
      hashtags = await Promise.all(hasharr.map((h)=>Hashtag.findOrCreate({where:h}).then((arr)=>arr[0])))
    }
  }
  var playlistId
  var youtubeChannelId
  if(req.body.playlistId){
    playlistId = req.body.playlistId
    youtubeChannelId = ""
  }else if(req.body.youtubeChannelId){
    playlistId=""
    youtubeChannelId = req.body.youtubeChannelId
  }
  var defaultVideoId = req.body.defaultVid
  var channel = await Channel.findByPk(req.params.id)
  var playlist = await Playlist.findByPk(channel.playlistId)
  var {name, description} = req.body
  try{
    if(playlistId || youtubeChannelId){
      await playlist.update({ youtubeId:playlistId, youtubeChannelId:youtubeChannelId })
    }
    await channel.update({ name, description })
    if(defaultVideoId){
      var program = await uploadProgram(defaultVideoId, req.user)
      await channel.setDefaultProgram(program)
    }
    if(hashtags && hashtags.length){
      await channel.setHashtags(hashtags)
    }
    res.status(200).json({channel})
  }catch(err){
    console.log(err)
    res.status(500).json(err);
  }
})

.delete('/:id', async (req, res, next) => {
  Channel.findOne({
    where: {id: req.params.id}
  })
  .then((channel) => {
    if((!req.user.admin && !req.user.superadmin) && channel.userId != req.user.id){
      throw new Error("forbidden")
    }
    if (channel) {
      turnOffChannelEmitter(channel)
      debugger
      console.log("test")
      return channel.destroy()
    } else {
      throw new Error('No channel found with matching id.')
    }
  })
  .then((ret) => {
    res.status(200).json(ret)
    return
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.post('/activate/:id', (req, res, next)=>{
  Channel.findOne({
    where: {id: req.params.id}
  })
  .then((channel) => {
    channel.active = true
    return channel.save()
  })
  .then(() => {
    res.send('OK')
  })
})

.post('/deactivate/:id', (req, res, next)=>{
  Channel.findOne({
    where: {id: req.params.id}
  })
  .then((channel) => {
    channel.active = false
    return channel.save()
  })
  .then(() => {
    res.send('OK')
  })
})
