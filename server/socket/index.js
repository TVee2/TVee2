var CronJob = require('cron').CronJob
const {User, Segment, Schedule, Program} = require('../db/models')

module.exports = io => {
  var prevtag = ''
  new CronJob(
    '* * * * * *',
    function() {
      var srctag = Math.floor(new Date().valueOf()/1000)

      Segment.findByPk(srctag, {include: [{model:Program}]})
      .then((segment)=>{
        io.emit('emission', segment)
      })
    },
    null,
    true,
    'America/Chicago'
  )
}
