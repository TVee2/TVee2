// 'use strict'

// const tvsrcs = require('../tvsrcs.json')
// const fs = require('fs')
// var ffprobe = require('ffprobe'),
//   ffprobeStatic = require('ffprobe-static')

// module.exports = require('express')
//   .Router()

//   .post('/timeslot', function(req, res) {
//     var obj = JSON.parse(fs.readFileSync('./tvsrcs.json', 'utf8'))
//     var day = req.body.day
//     var hr = req.body.hr
//     var min = req.body.min

//     var accessstr = `td${day}h${hr}m${min}`
//     var file = req.body.src
//     var vid = req.body.src.split('/').pop()
//     ffprobe(`./public/videos/${vid}`, {path: ffprobeStatic.path}).then(vid => {
//       var duration = vid.streams[0].duration
//       accessstr
//       day, hr, min
//       obj

//       var removeAllInPeriod = (day, hr, min) => {
//         var accessor = makeAccessStr(day, hr, min)
//         if (obj[accessor].src) {
//           obj[accessor] = {src: '', timeStart: '0:0:0', duration: 0}
//           removeAllInPeriod(decTime(day, hr, min))
//           removeAllInPeriod(incTime(day, hr, min))
//         }
//       }
//       removeAllInPeriod(day, hr, min)
//       var numSlotsFilled = Math.ceil(duration / 60)

//       for (var i = 0; i < numSlotsFilled; i++) {
//         console.log('filling')
//         obj[makeAccessStr(day, hr, min)] = {
//           src: file,
//           startTime: `${day}:${hr}:${min}`,
//           duration: duration
//         }
//         var newTime = incTime(day, hr, min)
//         day = newTime.day
//         hr = newTime.hr
//         min = newTime.min
//       }
//       fs.writeFileSync('./tvsrcs.json', JSON.stringify(obj), 'utf8')
//       res.header('Cache-Control', 'no-cache')
//       res.send('WUT')
//     })

//     //remove all videos in period
//     //write to period
//     var makeAccessStr = (day, hr, min) => {
//       return `td${req.body.day}h${req.body.hr}m${req.body.min}`
//     }

//     var decTime = (day, hr, min) => {
//       if (min === 0 && hr > 0) {
//         min = 59
//         if (hr === 0) {
//           hr = 23
//           if (day === 0) {
//             day = 6
//           } else {
//             day = day - 1
//           }
//         } else {
//           hr = hr - 1
//         }
//       } else {
//         min = min - 1
//       }
//       return {day, hr, min}
//     }
//     var incTime = (day, hr, min) => {
//       if (min === 59 && hr > 0) {
//         min = 0
//         if (hr === 23) {
//           hr = 0
//           if (day === 6) {
//             day = 0
//           } else {
//             day = day + 1
//           }
//         } else {
//           hr = hr + 1
//         }
//       } else {
//         min = min + 1
//       }
//       return {day, hr, min}
//     }
//   })

//   .get('/schedule', (req, res) => {
//     var obj = JSON.parse(fs.readFileSync('./tvsrcs.json', 'utf8'))
//     res.header('Cache-Control', 'no-cache')
//     res.json(obj)
//   })

//   .get('/resetsched', (req, res) => {
//     var obj = {}
//     for (var k = 0; k < 7; k++) {
//       for (var i = 0; i < 24; i++) {
//         for (var j = 0; j < 60; j++) {
//           var num = j % 3 + 1
//           obj[`td${k}h${i}m${j}`] = {src: '', timeStart: {}, duration: 0}
//         }
//       }
//     }
//     fs.writeFileSync('./tvsrcs.json', JSON.stringify(obj))
//     res.send('OK')
//   })




const multer = require('multer')
const fs = require('fs')
const router = require('express').Router()
const {User, Video, Program} = require('../db/models')
var ffprobe = require('ffprobe'), ffprobeStatic = require('ffprobe-static')

module.exports = router

const handleError = (err, res) => {
  res
    .status(500)
    .contentType('text/plain')
    .end('Oops! Something went wrong!')
}

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/videos/')
  },
  filename: function (req, file, cb) {
    let extArray = file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    cb(null, Date.now()+ '.' +extension)
  }
})

const upload = multer({storage})

router.post('/', upload.single('videofile' /* name attribute of <file> element in your form */),
  (req, res) => {
    var mime = req.file.mimetype.split('/')[0] 
    const tempPath = req.file.path
    var duration
    ffprobe(tempPath, {
      path: ffprobeStatic.path
    })
    .then((data)=>{
      duration = data.streams[0].duration
      if (mime === 'video') {
        Program.create({ad:false, title:req.body.title, duration:duration, userId:req.user.id})
        .then((program)=>{
          Video.create({path:tempPath, duration:duration, original:true})
          .then((video)=>{
            return program.addVideo(video)
          })
          .then((ret)=>{
            res
              .status(200)
              .json(ret)
          })
        })
        .catch((err)=>{})
      } else {
        fs.unlink(tempPath, err => {
          if (err) return handleError(err, res)

          res
            .status(403)
            .contentType('text/plain')
            .end('Only video files are allowed!')
        })
      }
    })
  }
)

router.get('/', (req, res) => {
  Program.findAll({where:{userId: req.user.id}})
  .then((videos)=>{
    res.json(videos)
  })
})
