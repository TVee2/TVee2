const {User, Segment, Schedule, Program, Channel, Timeslot} = require('../db/models')

var seed_daily_segments = async function() {
  Timeslot.findAll({where: {recurring: "dailyrecurring"}, include: {model: Program}})
  .then((ts) => {
    for(let i=0;i<Math.ceil((ts.endtime - ts.starttime)/1000);i++){
      var new_time = Math.floor((ts.starttime/1000) + i)
      var segment = await Segment.create({tkey:ts.channelId + new_time, progress:i, programId:ts.programId, timeslotId: ts.id, channelId:ts.channelId})
    }
  })
}

module.exports = seed_daily_segments
