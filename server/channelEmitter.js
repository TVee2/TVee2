const {User, Segment, Schedule, Program, Channel, Timeslot} = require('./db/models')
var CronJob = require('cron').CronJob

module.exports = (channel, io)=>{
  new CronJob(
    '* * * * * *',
    function() {
      var srctag = Math.floor(new Date().valueOf()/1000)
      Segment.findByPk(channel.id + '' + srctag, {include: [{model:Program}, {model:Channel}]})
      .then((segment)=>{
        if(segment && segment.channel.active){
          io.emit(channel.id, segment)
        }
      })
    },
    null,
    true,
    'America/Chicago'
  )
}