const router = require('express').Router()
const {User, Timeslot, Program, Video, Segment} = require('../db/models')
module.exports = router
const {Op} = require('sequelize')

router
.get('/:channelId', (req, res, next) => {
  var channelId = req.params.channelId
  // Timeslot.findAll({where:{channelId}})
  Timeslot.findAll({order: [['starttime', 'ASC']], include: {model: Program}})
  .then((timeslots)=>{
    res.json(timeslots)
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
  var {vid_title, date, hr, min, sec} = req.body
  var date = new Date(date)
  var now = new Date()

  if(now.getTime() > date.getTime()){

  }

  date.setHours(hr, min, sec)
  var date = date.getTime()
  Program.findOne({where:{title: vid_title}})
  .then((program) => {
    if(!program || !program.duration){
      return
    }else{
      var startDate = date
      var endDate = date + program.duration*1000

      const where = {
          [Op.or]: [{
              starttime: {
                  [Op.between]: [startDate, endDate]
              }
          }, {
              endtime: {
                  [Op.between]: [startDate, endDate]
              }
          }]
      }

      Timeslot.findOne({where})
      .then((ts)=>{
        if(!ts){
          return Timeslot.create({starttime:date, endtime:date+program.duration*1000})
          .then((ts) => {
            return ts.setProgram(program)
          })
          .then(async (ts)=>{
            for(let i=0;i<Math.ceil((ts.endtime - ts.starttime)/1000);i++){
              var new_time = Math.floor((ts.starttime/1000) + i)    
              var segment = await Segment.create({tkey:new_time, progress:i, programId:program.id, timeslotId: ts.id, channelId:1})
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
