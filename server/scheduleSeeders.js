module.exports = {seedNext2hrSegments, seedNext24HrTimeslots}
const {User, Channel, Playlist, Timeslot, Segment, PlaylistItem, Program} = require('./db/models')
const {Op} = require('sequelize')

async function seedNext2hrSegments(channelId){
  var now = new Date().getTime()
  var timeslots = []
  if(channelId){
    timeslots = await Timeslot.findAll({where: {channelId, starttime:{[Op.lt]:(now+(60*60*2*1000))}, recurring:{[Op.not]:"recurring"}, seeded:false}, include: {model: Program}})
  }else{
    timeslots = await Timeslot.findAll({where: {starttime:{[Op.lt]:(now+(60*60*2*1000))}, recurring:{[Op.not]:"recurring"}, seeded:false}, include: {model: Program}})
  }

  var arr = []
  let timeslot
  for(var j = 0;j<timeslots.length;j++){
    timeslot = timeslots[j]
    if(timeslot.endtime < now){
      timeslot.seeded = true
      await timeslot.save()
      console.log("skipping past timeslot", timeslot.id)
      continue
    }
    arr = []
    let segment
    let tkey
    let new_time
    for(let i=0;i<Math.ceil((timeslot.endtime - timeslot.starttime)/1000);i++){
      new_time = Math.floor((timeslot.starttime/1000) + i)
      tkey = timeslot.channelId + '' + new_time
      arr.push({tkey, time:new_time, progress:i, programId:timeslot.programId, timeslotId: timeslot.id, channelId:timeslot.channelId})
    }
    console.log(`timeslot ${timeslot.id} - seeding ${arr.length} segments`)
    await Segment.bulkCreate(arr, { ignoreDuplicates: true })
    timeslot.seeded = true
    await timeslot.save()
  }
}

function indexOfMatch(array, fn) {
  var result = -1;
  array.some(function(e, i) {
    if (fn(e)) {
      result = i
      return true
    }
  })
  return result
}

async function seedNext24HrTimeslots(channelId, seedSegments){
  console.log("seeding slots")
  if(!channelId){
    console.log("no id passed to seeder")
    return
  }
  var channel = await Channel.findByPk(channelId)
  var playlist = await Playlist.findByPk(channel.playlistId)
  if(!playlist){
    return
  }
  //get last timeslot item, return if enddate is greater than 24 hr from now
  var items = await PlaylistItem.findAll({where:{playlistId:playlist.id}, order:[['position','ASC']]})
  var now = Math.floor(new Date().getTime()/1000)
  var timecounter = now
  var lastTimeslot = await Timeslot.findOne({limit:1, include: {model:Program}, order:[['starttime', 'DESC']], where:{channelId:channel.id}})
  var j = 0

  //seed programs for all timeslot items
  var item_arr = []
  for(var i=0;i<items.length;i++){
    let item = items[i]
    if(item.embeddable && parseInt(item.duration) > 25){    
      let {id, title, thumbnailUrl, duration, width, height, youtubeId} = item
      var program = await Program.findOrCreate({where: {title, thumbnailUrl, width, height, duration, youtubeId}})
      if(Array.isArray(program)){
        program = program[0]
      }
      item_arr.push({item, program})
    }
  }

  if(lastTimeslot && lastTimeslot.program && lastTimeslot.program.youtubeId){
    timecounter = Math.floor(parseInt(lastTimeslot.endtime)/1000)
    var matchIndex = indexOfMatch(item_arr, (item)=>{return lastTimeslot.program.youtubeId == item.program.youtubeId})
    j = matchIndex===-1?0:matchIndex
    if(j==item_arr.length-1){
      j=0
    }else{
      j++
    }
  }

  //while loop, start on last item and move up position, incremenet time each loop iteration
  console.log("channelid", channelId, "playlistarr length", item_arr.length)

  while(timecounter < (now+(60*60*24))) {
    if(!item_arr.length){
      console.log("no videos in playlist or items are less than 25 seconds")
      break
    }
    var {title, thumbnailUrl, duration, youtubeId, position} = item_arr[j].item
    duration = parseInt(duration)
    if((timecounter+duration)>now){
      var program = item_arr[j].program
      console.log(`incrementor ${j} - channel id ${channelId} - time ${(timecounter-now)/(60*60)} hrs from now - seeding program id ${program.id} and position ${position} into timeslot`)
      var ts = await Timeslot.create({programId:program.id, channelId, starttime:timecounter*1000, endtime:(timecounter+duration)*1000, recurring:false})     
    }else{
      console.log("skipping past timeslot creation")
    }

    var offset = 5
    timecounter = timecounter + duration + offset

    if(j==item_arr.length-1){
      j=0
    }else{
      j++
    }
  }

  if(seedSegments){   
    seedNext2hrSegments(channelId)
  }
  return "seeded timeslots"
}

