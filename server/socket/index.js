var CronJob = require('cron').CronJob
const {User, Segment, Schedule, Program, Video, Channel, Timeslot} = require('../db/models')

module.exports = io => {
    new CronJob(
    '0 23 * * * *',
    () => {
      Timeslot.findAll({where: {recurring: "dailyrecurring"}, include: {model: Program}})
      .then(async (ts) => {
        for(let i=0;i<Math.ceil((ts.endtime - ts.starttime)/1000);i++){
          var new_time = Math.floor((ts.starttime/1000) + i)
          var segment = await Segment.create({tkey:ts.channelId + '' + new_time, progress:i, programId:ts.programId, timeslotId: ts.id, channelId:ts.channelId})
        }
      })
    },
    null,
    true,
    'America/Chicago'
  )

  Channel.findAll()
  .then((channels) => {
    channels.map((channel) => {
      new CronJob(
        '* * * * * *',
        function() {
          var srctag = Math.floor(new Date().valueOf()/1000)
          Segment.findByPk(channel.id + '' + srctag, {include: [{model:Program, include:{model:Video}}]})
          .then((segment)=>{
            io.emit(channel.name, segment)
          })
        },
        null,
        true,
        'America/Chicago'
      )
    })
  })
}
