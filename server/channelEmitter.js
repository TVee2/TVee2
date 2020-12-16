const {User, Segment, Schedule, Program, Video, Channel, Timeslot} = require('./db/models')
var CronJob = require('cron').CronJob

module.exports = (channel, io)=>{
  // let init = true
  new CronJob(
    '* * * * * *',
    function() {
      var srctag = Math.floor(new Date().valueOf()/1000)
      Segment.findByPk(channel.id + '' + srctag, {include: [{model:Program, include:{model:Video}}]})
      .then((segment)=>{
        // if(segment && (segment.progress == "0" || init) && segment.program && segment.program.videos[0] && segment.program.videos[0].awsKey){
        //   console.log("getting aws key")
        //   var video = segment.program.videos[0]
        //   const awsUrl = s3.getSignedUrl('getObject', {
        //       Bucket: AWS_BUCKET_NAME,
        //       Key: video.awsKey,
        //       Expires: 4 * 60 * 60
        //   })
        //   video.path = awsUrl
        //   video.save()
        // }

        // init = false
        io.emit(channel.id, segment)
      })
    },
    null,
    true,
    'America/Chicago'
  )
}