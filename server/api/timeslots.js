const router = require('express').Router()
const {User, Timeslot, Program, Video, Segment} = require('../db/models')
module.exports = router
const {Op} = require('sequelize')

router
.get('/:channelId', (req, res, next) => {
  var channelId = req.params.channelId

  // const where_after = {
  //   [Op.and]: [
  //     {channelId: req.params.channelId},
  //     {starttime: {
  //       [Op.gt]: new Date().getTime()
  //     }}
  //   ]
  // }

  // const where_before = {
  //   [Op.and]: [
  //     {channelId: req.params.channelId},
  //     {starttime: {
  //       [Op.lt]: new Date().getTime()
  //     }}
  //   ]
  // }

  // Timeslot.findAll({order: [['starttime', 'ASC']], include: {model: Program}, where:where_before})
  // .then((before_ts)=>{
  //   return Timeslot.findAll({order: [['starttime', 'ASC']], include: {model: Program}, where:where_after})
  //   .then((after_ts)=>{
  //     res.json({before_ts, after_ts})
  //   })
  // })
  var today = new Date()
  var tomorrow = new Date()
  var dayaftertommorrow = new Date()
  today.setHours(0,0,0,0)
  tomorrow.setDate(today.getDate()+1)
  tomorrow.setHours(0,0,0,0)
  dayaftertommorrow.setDate(today.getDate()+2)
  dayaftertommorrow.setHours(0,0,0,0)

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
})

.delete('/previous', (req, res, next) => {
  console.log("in destroy")
  Segment.destroy({where: {time:{[Op.lt]:new Date().getTime()}}})
  .then((ts)=>{
    Segment.findAll()
    .then((all) => {
      console.log("destroyed")
      res.json({prev:"deleted"})
    })
  })
  .catch((err)=>{console.log(err)})
})

.delete('/all', (req, res, next) => {
  Segment.destroy({where: {}})
  .then((ret)=>{
    return Timeslot.destroy({where: {}})
  })
  .then((ret)=>{
    res.json({})
  })
  .catch((err)=>{console.log(err)})
})

.delete('/:timeslotId', (req, res, next) => {
  Timeslot.findByPk(req.params.timeslotId)
  .then((ts)=>{
    return ts.destroy()
  })
  .then((ts)=>{
    res.json(ts)
  })
})


.post('/:channelId', (req, res, next) => {
  var io = req.app.locals.io

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
    io.emit(upload_time, `theres been an error`)
    console.log(err)})
})

// .post('/:channelId/experimental', (req, res, next) => {
//   var date = new Date(date)
//   var now = new Date()

//   date.setHours(hr, min, sec)
//   var date = date.getTime()

//   var startDate = date
//   var endDate = date + program.duration*1000

//   for(var i = 0;i<120;i++){
//     //seed 120 segments from now till 120 segments from now, alternate sample videos

//   }

//   Timeslot.create({starttime:date, endtime:Math.ceil(date+program.duration*1000), recurring, channelId:req.params.channelId})
//     .then((ts) => {
//       return ts.setProgram(program)
//     })
//     .then(async (ts)=>{
//       for(let i=0;i<(ts.endtime - ts.starttime)/1000;i++){
//         var new_time = Math.floor((ts.starttime/1000) + i)
//         var segment = await Segment.create({tkey:req.params.channelId + '' + new_time, progress:i, programId:program.id, timeslotId: ts.id, channelId:req.params.channelId})
//       }
//     })
//     .then(()=>{
//       res.json(ts)
//     })
//   .catch((err)=>{console.log(err)})
// })

