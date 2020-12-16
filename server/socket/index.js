var CronJob = require('cron').CronJob
const {User, Segment, Schedule, Program, Video, Channel, Timeslot, Playlist, PlaylistItem} = require('../db/models')
const {Op} = require('sequelize')

const AWS = require('aws-sdk');
const AWS_ID = process.env.AWS_ID
const AWS_SECRET = process.env.AWS_SECRET
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME
const turnOnChannelEmitter = require('../channelEmitter')
const s3 = new AWS.S3({
    accessKeyId: AWS_ID,
    secretAccessKey: AWS_SECRET,
    region: 'us-east-2',
    signatureVersion: 'v4',
    httpOptions: { timeout: 10 * 60 * 1000 },
});

module.exports = async io => {
  //any time we re initialize, seed segments

  var seedSegments = () => {
    console.log("seeding segments")
    var now = Math.floor(new Date().getTime()/1000)*1000
    Timeslot.findAll({where: {starttime:{[Op.lt]:(now+(60*60*2*1000))}, recurring:{[Op.not]:"recurring"}, seeded:false}, include: {model: Program}})
    .then(async (timeslots) => {
      var arr = []
      let timeslot
      for(var j = 0;j<timeslots.length;j++){
        timeslot = timeslots[j]
        for(let i=0;i<Math.ceil((timeslot.endtime - timeslot.starttime)/1000);i++){
          var new_time = Math.floor((timeslot.starttime/1000) + i)
          arr.push({tkey:timeslot.channelId + '' + new_time, progress:i, programId:timeslot.programId, timeslotId: timeslot.id, channelId:timeslot.channelId})
          // var segment = await Segment.create({tkey:ts.channelId + '' + new_time, progress:i, programId:ts.programId, timeslotId: ts.id, channelId:ts.channelId})
          await Segment.bulkCreate(arr)
          console.log(arr.length, "segments created")
        }
        ts.seeded = true
        ts.save()
      }
    })
  }

  function indexOfMatch(array, fn) {
    var result = -1;
    array.some(function(e, i) {
      if (fn(e)) {
        result = i;
        return true;
      }
    });
    return result;
  }

  var seedTimeslots =  async () => {
    console.log("seeding timeslots")
    var channels = await Channel.findAll({include: [{model:PlaylistItem, as: "lastSeededPlaylistItem"}, {model:Playlist, include:{model:PlaylistItem}}], order:[[Playlist, PlaylistItem, 'position', 'ASC']]})
    var now = Math.floor(new Date().getTime()/1000)*1000
    channels.forEach((channel)=>{
      if(channel.playlistId){
        Timeslot.findAll({limit:1, where: {channelId:channel.id}, order: [['starttime','DESC']]})
        .then( async(timeslot)=>{
          var new_start = now
          if(timeslot.length){
            //seed 28 hours
            new_start = parseInt(timeslot[0].endtime)
          }

          var end_seed_time = now + 60*60*1000*28
          var lastSeededItem = channel.lastSeededPlaylistItem
          var playlistItems = channel.playlist.playlistItems
          var item_arr = []
          for(var i=0;i<playlistItems.length;i++){
            let item = playlistItems[i]
            let {title, thumbnailUrl, duration, ytVideoId} = item
            var program = await Program.findOrCreate({where: {title, thumbnailUrl, duration, ytVideoId}})
            if(Array.isArray(program)){
              program = program[0]
            }
            item_arr.push({item, program})
          }

          var i = 0
          if(lastSeededItem){
            var lastItemIndex = indexOfMatch(playlistItems, (item)=>{return item.id==lastSeededItem.id})
            if(lastItemIndex>-1){
              //seed from last item
              i = lastItemIndex
            }
          } 
          var timecounter = new_start
          let current_item=null
          while(true){
            current_item = item_arr[i].item
            current_program = item_arr[i].program
            var arr = []
            var duration = parseInt(current_item.duration)
            var ts = await Timeslot.create({starttime:timecounter, endtime:timecounter+duration*1000, programId:current_program.id})
            console.log(ts.id, "timeslot created")
            timecounter = timecounter + duration
            if(timecounter<end_seed_time){
              break
            }
            if(i==item_arr.length-1){
              i=0
            }else{
              i++
            } 
          }
          await channel.setLastSeededPlaylistItem(current_item)
        })
      }
    })
  }
  await seedTimeslots()
  console.log(1)
  await seedSegments()
  console.log(2)
  new CronJob(
  '0 0 * * * *',
  seedSegments,
  null,
  true,
  'America/Chicago'
  )

  new CronJob(
  '0 20 * * * *',
  seedTimeslots,
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
      //for aws srcs
      // let init = true
      // new CronJob(
      //   '* * * * * *',
      //   function() {
      //     var srctag = Math.floor(new Date().valueOf()/1000)
      //     Segment.findByPk(channel.id + '' + srctag, {include: [{model:Program, include:{model:Video}}]})
      //     .then((segment)=>{
      //       if(segment && (segment.progress == "0" || init) && segment.program && segment.program.videos[0] && segment.program.videos[0].awsKey){
      //         console.log("getting aws key")
      //         var video = segment.program.videos[0]
      //         const awsUrl = s3.getSignedUrl('getObject', {
      //             Bucket: AWS_BUCKET_NAME,
      //             Key: video.awsKey,
      //             Expires: 4 * 60 * 60
      //         })
      //         video.path = awsUrl
      //         video.save()
      //       }

      //       init = false
      //       io.emit(channel.id, segment)
      //     })
      //   },
      //   null,
      //   true,
      //   'America/Chicago'
      // )

  // new CronJob(
  // '0 23 * * * *',
  // () => {
  //   Segment.destroy({where: {time:{[Op.lt]:new Date().getTime()}}})

  //   Timeslot.findAll({where: {recurring: "dailyrecurring"}, include: {model: Program}})
  //   .then(async (timeslots) => {
  //     var arr = []
  //     let timeslot
  //     for(var j = 0;j<timeslots.length;j++){
  //       timeslot = timeslots[j]
  //       for(let i=0;i<Math.ceil((timeslot.endtime - timeslot.starttime)/1000);i++){
  //         var new_time = Math.floor((timeslot.starttime/1000) + i)
  //         arr.push({tkey:timeslot.channelId + '' + new_time, progress:i, programId:timeslot.programId, timeslotId: timeslot.id, channelId:timeslot.channelId})
  //         // var segment = await Segment.create({tkey:ts.channelId + '' + new_time, progress:i, programId:ts.programId, timeslotId: ts.id, channelId:ts.channelId})
  //         await Segment.bulkCreate(arr)
  //       }
  //     }
  //   })
  // },
  // null,
  // true,
  // 'America/Chicago'
  // )