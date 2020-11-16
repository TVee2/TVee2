const router = require('express').Router()
const {User, Timeslot, Program, Video, Segment} = require('../db/models')
module.exports = router
const {Op} = require('sequelize')

router
.get('/:channelId', (req, res, next) => {
  var channelId = req.params.channelId

  const where_after = {
    [Op.and]: [
      {channelId: req.params.channelId},
      {starttime: {
        [Op.gt]: new Date().getTime()
      }}
    ]
  }

  const where_before = {
    [Op.and]: [
      {channelId: req.params.channelId},
      {starttime: {
        [Op.lt]: new Date().getTime()
      }}
    ]
  }

  Timeslot.findAll({order: [['starttime', 'ASC']], include: {model: Program}, where:where_before})
  .then((before_ts)=>{
    return Timeslot.findAll({order: [['starttime', 'ASC']], include: {model: Program}, where:where_after})
    .then((after_ts)=>{
      res.json({before_ts, after_ts})
    })
  })

})

.delete('/:timeslotId', (req, res, next) => {
  Timeslot.findByPk(req.params.timeslotId)
  .then((ts)=>{
    return ts.destroy()
  })
  .then((ts)=>{
    res.setStatus(205).json(ts)
  })
})

.post('/:channelId', (req, res, next) => {
  var {vid_title, date, hr, min, sec, recurring} = req.body
  var date = new Date(date)
  var now = new Date()
  if(recurring==="dailyrecurring"){
    date = new Date()
  }

  date.setHours(hr, min, sec)
  var date = date.getTime()
  Program.findOne({where:{title: vid_title}})
  .then((program) => {
    if(!program || !program.duration){
      console.log(vid_title)
      res.sendStatus(400)
    }else{
      var startDate = date
      var endDate = date + program.duration*1000

      const where = {
        [Op.and]: [
          {channelId:req.params.channelId},
          {[Op.or]: [{
            starttime: {
                [Op.between]: [startDate, endDate]
            }
          }, {
            endtime: {
                [Op.between]: [startDate, endDate]
            }
          }]}
        ]
      }

      Timeslot.findOne({where})
      .then((ts)=>{
        if(!ts){
          return Timeslot.create({starttime:date, endtime:Math.ceil(date+program.duration*1000), recurring, channelId:req.params.channelId})
          .then((ts) => {
            return ts.setProgram(program)
          })
          .then(async (ts)=>{
            for(let i=0;i<(ts.endtime - ts.starttime)/1000;i++){
              var new_time = Math.floor((ts.starttime/1000) + i)
              var segment = await Segment.create({tkey:req.params.channelId + '' + new_time, progress:i, programId:program.id, timeslotId: ts.id, channelId:req.params.channelId})
            }
          })
          .then(()=>{
            res.json(ts)
          })
        }else{
          res.json({conflict_timeslot: ts})
        }
      })
    }
  })
  .catch((err)=>{console.log(err)})
})
