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
    const newPath = req.file.path.split('/').slice(1).join('/')
    var duration
    ffprobe(tempPath, {
      path: ffprobeStatic.path
    })
    .then((data)=>{
      duration = data.streams[0].duration
      if (mime === 'video') {
        Program.create({ad:false, title:req.body.title, duration:duration, userId:req.user.id})
        .then((program)=>{
          Video.create({path:newPath, duration:duration, original:true})
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
