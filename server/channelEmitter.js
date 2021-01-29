const {User, Segment, Schedule, Program, Channel, Timeslot} = require('./db/models')
var CronJob = require('cron').CronJob

var jobs = {}
module.exports.turnOffChannelEmitter = (channel) => {
  var job = jobs[channel.id]
  job.stop()
}

module.exports.turnOnChannelEmitter = (channel, io)=>{
  jobs[channel.id] = new CronJob(
    '* * * * * *',
    function() {
      var srctag = Math.floor(new Date().valueOf()/1000)
      Segment.findByPk(channel.id + '' + srctag, {include: [{model:Program}, {model:Channel}]})
      .then((segment)=>{
        if(channel.active){
          io.emit(channel.id, segment)
        }
      })
    },
    null,
    true,
    'America/Chicago'
  )
}
