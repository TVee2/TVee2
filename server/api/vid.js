const multer = require('multer')
const fs = require('fs')
const router = require('express').Router()
const {User, Video, Program} = require('../db/models')
var ffprobe = require('ffprobe'), ffprobeStatic = require('ffprobe-static')

const AWS = require('aws-sdk');
const multerS3 = require('multer-s3')

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
var options = { partSize: 5 * 1024 * 1024, queueSize: 10 };  

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
  },
  onError: function (err, next){
    console.log('errorupload', err)
  }
})

const upload = multer({storage})

const aws_upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: AWS_BUCKET_NAME,
        key: function (req, file, cb) {
          let extArray = file.mimetype.split("/");
          let extension = extArray[extArray.length - 1];
          cb(null, Date.now()+ '.' +extension)
        },
        body: function(req, file, cb) {

        }
    })
});

router.post('/',
  (req, res) => {
    console.log("received request to upload local")
    var upload_file = upload.single('videofile')/* name attribute of <file> element in your form */
    console.log("uploaded")

    upload_file(req, res, function(err) {
      if(err){
        console.log(err)
        res.json(err)
      }else{
        var mime = req.file.mimetype.split('/')[0] 

        const tempPath = req.file.path

        const newPath = '/'+req.file.path.split('/').slice(1).join('/')

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
                 res.send("Uploaded!");
              })
            })
            .catch((err)=>{res.json({error:err})})
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
    })

  }
)




router.get('/awspresignedpost', (req, res) => {
  const awsPath = s3.createPresignedPost({
      Bucket: AWS_BUCKET_NAME,
      // Fields: {key:""},
      Expires: 60*60,
      Conditions: [
        ["starts-with", "$Key", ""],
      ],
  })
  res.json({path:awsPath})
})

router.post('/aws/metadata', (req, res)=>{
  var key = req.body.key
  const awsPath = s3.getSignedUrl('getObject', {
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Expires: 60 * 60
  })

  ffprobe(awsPath, {
    path: ffprobeStatic.path
  })
  .then((data)=>{
    var duration = data.streams[0].duration
    Program.create({ad:false, title:req.body.title, duration:duration, userId:req.user.id})
    .then((program)=>{
      Video.create({path:null, awsKey:key, duration:duration, original:true})
      .then((video)=>{
        return program.addVideo(video)
      })
      .then((ret)=>{
         res.send("Metadata created!");
      })
    .catch((err)=>{res.json({error:err})})
    })
  })
})


router.post('/aws', (req, res) => {


  // var upload_file = aws_upload.array('videofile', 1)
  // upload_file(req, res, (err) => {
  //       var file = req.files[0]
  //       var mime = file.mimetype.split('/')[0] 

  //       const newPath = file.location

        // const awsPath = s3.createPresignedPost('putObject', {
        //     Bucket: AWS_BUCKET_NAME,
        //     Fields: {key:'videofile'},
        //     Expires: 60 * 5,
        //     Conditions: [
        //       ["starts-with", "$Content-Type", "video/"],
        //     ],
        // })
        // res.json({path:awsPath})
        // const awsPath = s3.getSignedUrl('getObject', {
        //     Bucket: AWS_BUCKET_NAME,
        //     Key: file.key,
        //     Expires: 60 * 5
        // })


  //       console.log(awsPath)
  //       ffprobe(awsPath, {
  //         path: ffprobeStatic.path
  //       })
  //       .then((data)=>{
  //         var duration = data.streams[0].duration

  //         if(err || mime!=="video"){
  //           console.log("Error uploading to aws - ", err)
  //           res.json(err)
  //         }
  //         Program.create({ad:false, title:req.body.title, duration:duration, userId:req.user.id})
  //         .then((program)=>{
  //           Video.create({path:newPath, duration:duration, original:true})
  //           .then((video)=>{
  //             return program.addVideo(video)
  //           })
  //           .then((ret)=>{
  //              res.send("Uploaded!");
  //           })
  //         .catch((err)=>{res.json({error:err})})
  //       })
  //   })
  // })
})

router.get('/', (req, res) => {
  Program.findAll({where:{userId: req.user.id}})
  .then((videos)=>{
    res.json(videos)
  })
})
