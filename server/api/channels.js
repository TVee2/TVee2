const router = require('express').Router()
const {User, Channel, Playlist, Timeslot, Segment, PlaylistItem, Program} = require('../db/models')
const turnOnChannelEmitter = require('../channelEmitter')

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
      res.json({err:"cant create more channels"})
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

  //initialize channel
  var channel = await Channel.findByPk(channelId)
  var playlist = await Playlist.findByPk(playlistId)
  channel.setPlaylist(playlist)
  var items = await PlaylistItem.findAll({where:{playlistId:playlist.id}, order:[['position','ASC']]})

  var now = Math.floor(new Date().getTime()/1000)
  var timecounter = now

  var item_arr = []

  for(var i=0;i<items.length;i++){
    let item = items[i]
    let {title, thumbnailUrl, duration, width, height, ytVideoId} = item
    var program = await Program.findOrCreate({where: {title, thumbnailUrl, width, height, duration, ytVideoId}})
    if(Array.isArray(program)){
      program = program[0]
    }
    item_arr.push({item, program})
  }

  var i = 0
  while(timecounter < (now+(60*60*24))) {
    var {title, thumbnailUrl, duration, ytVideoId} = item_arr[i].item
    duration = parseInt(duration)
    var program = item_arr[i].program

    var ts = await Timeslot.create({programId:program.id, channelId, starttime:timecounter*1000, endtime:(timecounter+duration)*1000, recurring:false})

    if(timecounter < (now+(60*60*2))){
      var arr = []
      for(var j = 0;j<duration;j++){
        arr.push({tkey:channelId+(timecounter+j), time:(timecounter+j)*1000, progress:j, programId:program.id, timeslotId:ts.id, channelId})
      }
      await Segment.bulkCreate(arr, { ignoreDuplicates: true })
      ts.seeded=true
      await ts.save()
    }

    timecounter = timecounter + duration

    if(i==item_arr.length-1){
      i=0
    }else{
      i++
    }
  }

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
