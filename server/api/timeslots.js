const router = require('express').Router()
const {User, Timeslot, Program, Segment} = require('../db/models')
module.exports = router
const {Op} = require('sequelize')

router

.get('/all', (req, res, next)=>{
  Timeslot.findAll({
    order: [['createdAt', 'DESC']],
  })
  .then((items)=>{
    res.status(200).json(items)
  })
})

.get('/:channelId', (req, res, next) => {
  var channelId = req.params.channelId
  var timezone_diff = parseInt(req.query.offset) - new Date().getTimezoneOffset()

  var today = new Date()
  var tomorrow = new Date()
  var dayaftertommorrow = new Date()

  today = new Date(today.getTime() - timezone_diff*60000)
  tomorrow = new Date(tomorrow.getTime() - timezone_diff*60000)
  dayaftertommorrow = new Date(dayaftertommorrow.getTime() + timezone_diff*60000)

  today.setHours(0,timezone_diff,0,0)
  tomorrow.setDate(today.getDate()+1)
  tomorrow.setHours(0,timezone_diff,0,0)
  dayaftertommorrow.setDate(today.getDate()+2)
  dayaftertommorrow.setHours(0,timezone_diff,0,0)

  const today_where = {
    [Op.and]: [
      {channelId},
      {starttime: {
        [Op.lt]: tomorrow.getTime()
      }},
      {endtime: {
        [Op.gt]: today.getTime()
      }}
    ]
  }

  const tomorrow_where = {
    [Op.and]: [
      {channelId},
      {starttime: {
        [Op.lt]: dayaftertommorrow.getTime()
      }},
      {endtime: {
        [Op.gt]: tomorrow.getTime()
      }}
    ]
  }

  Timeslot.findAll({order: [['starttime', 'ASC']], include: {model: Program}, where:today_where})
  .then((today_ts)=>{
    Timeslot.findAll({order: [['starttime', 'ASC']], include: {model: Program}, where:tomorrow_where})
    .then((tomorrow_ts) => {
      res.json({today:today_ts, tomorrow:tomorrow_ts})
    })
  })
  .catch((err)=>{
    res.status(500).send(err)
  })
})

.delete('/previous', (req, res, next) => {
  Segment.destroy({where: {time:{[Op.lt]:new Date().getTime()}}})
  .then((ts)=>{
    Segment.findAll()
    .then((all) => {
      res.json({prev:"deleted"})
    })
  })
  .catch((err)=>{
    res.status(500).send(err)   
  })
})

.delete('/all', (req, res, next) => {
  Segment.destroy({where: {}})
  .then((ret)=>{
    return Timeslot.destroy({where: {}})
  })
  .then((ret)=>{
    res.json({})
  })
  .catch((err)=>{
    res.status(500).send(err)
  })
})

.delete('/:timeslotId', (req, res, next) => {
  Timeslot.findByPk(req.params.timeslotId)
  .then((ts)=>{
    return ts.destroy()
  })
  .then((ts)=>{
    res.json(ts)
  })
  .catch((err) => {
    res.status(500).send(err)
  })
})


.post('/:channelId', (req, res, next) => {
  var {vid_title, date, upload_time, recurring} = req.body
  var date = new Date(date).getTime()
  var now = new Date()
  if(recurring==="dailyrecurring"){
    date = new Date()
  }

  Program.findOne({where:{title: vid_title}})
  .then((program) => {
    if(!program || !program.duration){
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
        var io = req.app.locals.io
        if(!ts){
          return Timeslot.create({starttime:date, endtime:Math.ceil(date+program.duration*1000), recurring, channelId:req.params.channelId})
          .then((ts) => {
            return ts.setProgram(program)
          })
          .then(async (ts)=>{
            for(let i=0;i<(ts.endtime - ts.starttime)/1000;i++){
              io.emit(upload_time, `on ${i} out of ${(ts.endtime - ts.starttime)/1000}`)
              var new_time = Math.floor((ts.starttime/1000) + i)
              var segment = await Segment.create({tkey:req.params.channelId + '' + new_time, time: new_time, progress:i, programId:program.id, timeslotId: ts.id, channelId:req.params.channelId})
              if(!segment){
                console.log("failed to create", i)
              }
            }
          })
          .then(()=>{
            io.emit(upload_time, `done`)
            res.json({})
          })
        }else{
          io.emit(upload_time, `conflict`)
          res.json({conflict_timeslot: ts})
        }
      })
    }
  })
  .catch((err)=>{
    var io = req.app.locals.io

    io.emit(upload_time, `theres been an error`)
    res.status(500).send(err)
  })
})

.delete('/:id', (req, res, next) => {
  Timeslot.findOne({
    where: {id: req.params.id}
  })
  .then((timeslot) => {
    if(!req.user.admin || timeslot.userId != req.user.id){
      throw new Error("forbidden")
    }
    if (timeslot) {
      return timeslot.destroy()
    } else {
      throw new Error('No timeslot found with matching id.')
    }
  })
  .then((ret) => {
    res.status(200).json(ret)
    return
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})
