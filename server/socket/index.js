var CronJob = require('cron').CronJob
const {User, Segment, Schedule, Program, Video, Channel, Timeslot} = require('../db/models')

const AWS = require('aws-sdk');
const AWS_ID = process.env.AWS_ID
const AWS_SECRET = process.env.AWS_SECRET
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME

const s3 = new AWS.S3({
    accessKeyId: AWS_ID,
    secretAccessKey: AWS_SECRET,
    region: 'us-east-2',
    signatureVersion: 'v4',
    httpOptions: { timeout: 10 * 60 * 1000 },
});

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
      let init = true
      new CronJob(
        '* * * * * *',
        function() {
          var srctag = Math.floor(new Date().valueOf()/1000)
          Segment.findByPk(channel.id + '' + srctag, {include: [{model:Program, include:{model:Video}}]})
          .then((segment)=>{
            if(segment && (segment.progress == "0" || init) && segment.program && segment.program.videos[0] && segment.program.videos[0].awsKey){
              console.log("getting aws key")
              var video = segment.program.videos[0]
              const awsUrl = s3.getSignedUrl('getObject', {
                  Bucket: AWS_BUCKET_NAME,
                  Key: video.awsKey,
                  Expires: 4 * 60 * 60
              })
              video.path = awsUrl
              video.save()
            }

            init = false
            io.emit(channel.id, segment)
          })
        },
        null,
        true,
        'America/Chicago'
      )
    })
  })
}
