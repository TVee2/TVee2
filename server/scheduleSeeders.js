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
    arr = []
    timeslot = timeslots[j]
    let segment
    let tkey
    let new_time
    for(let i=0;i<Math.ceil((timeslot.endtime - timeslot.starttime)/1000);i++){
      new_time = Math.floor((timeslot.starttime/1000) + i)
      tkey = timeslot.channelId + '' + new_time
      arr.push({tkey, progress:i, programId:timeslot.programId, timeslotId: timeslot.id, channelId:timeslot.channelId})
    }
    console.log(`seeding ${arr.length} segments`)
    await Segment.bulkCreate(arr, { ignoreDuplicates: true })
    timeslot.seeded = true
    await timeslot.save()
  }


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
  var lastTimeslot = await Timeslot.findOne({limit:1, include: {model:Program, include:{model:PlaylistItem}}, order:[['starttime', 'DESC']], where:{channelId:channel.id}})
  var i = 0
  if(lastTimeslot && lastTimeslot.program && lastTimeslot.program.playlistItem){
    timecounter = Math.floor(parseInt(lastTimeslot.endtime)/1000)
    var matchIndex = indexOfMatch(items, (item)=>{return lastTimeslot.program.playlistItem.id == item.id})
    i = matchIndex===-1?0:matchIndex
  }

  //seed programs for all timeslot items
  var item_arr = []
  for(i;i<items.length;i++){
    let item = items[i]
    if(item.embeddable){    
      let {id, title, thumbnailUrl, duration, width, height, ytVideoId} = item
      var program = await Program.findOrCreate({where: {title, thumbnailUrl, width, height, duration, ytVideoId, playlistItemId:id}})
      if(Array.isArray(program)){
        program = program[0]
      }
      item_arr.push({item, program})
    }
  }

  //while loop, start on last item and move up position, incremenet time each loop iteration
  var j = 0
  while(timecounter < (now+(60*60*24))) {
    var {title, thumbnailUrl, duration, ytVideoId} = item_arr[j].item
    duration = parseInt(duration)
    var program = item_arr[j].program

    console.log(`seeding program ${program.id} into timeslot`)

    var ts = await Timeslot.create({programId:program.id, channelId, starttime:timecounter*1000, endtime:(timecounter+duration)*1000, recurring:false})

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

