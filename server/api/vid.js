'use strict'

const tvsrcs = require('../tvsrcs.json')
const fs = require('fs')
var ffprobe = require('ffprobe'),
    ffprobeStatic = require('ffprobe-static');

module.exports = require('express').Router()
  .get('/', (req, res)=>{
      var now = new Date()
      var day = now.getDay()
      var hour = now.getHours()
      var min = now.getMinutes()
      var sec = now.getSeconds()
      var srctag =`td${day}h${hour}m${min}`
      var startTimeArr = tvsrcs[srctag].timeStart.split(':')

      var dayStart = startTimeArr[0]
      var hourStart = startTimeArr[1]
      var minStart = startTimeArr[2]

      function convertTimeToMin(day, hour, min, sec){
        return day*24*60*60 + hour*60*60 + min*60 + sec
      }
      var progress = convertTimeToMin(day, hour, min, sec) - convertTimeToMin(dayStart, hourStart, minStart, 0)

      tvsrcs[srctag].progress = progress

      res.header('Cache-Control', 'no-cache');
      res.json(tvsrcs[srctag])
  })

  .post('/upload', function(req, res) {
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('./public/videos/filename.jpg', function(err) {
      if (err)
        return res.status(500).send(err);

      res.send('File uploaded!');
    });
  })

  .post('/timeslot', function(req, res) {
      var obj = JSON.parse(fs.readFileSync('./tvsrcs.json', 'utf8'))
      var day = req.body.day
      var hr = req.body.hr
      var min = req.body.min

      var accessstr = `td${day}h${hr}m${min}`
      var file = req.body.src
      var vid = req.body.src.split('/').pop()
      ffprobe(`./public/videos/${vid}`, { path: ffprobeStatic.path })
      .then((vid)=>{
        var duration = vid.streams[0].duration
        accessstr
        day, hr, min
        obj

        var removeAllInPeriod = (day, hr, min)=>{
          var accessor = makeAccessStr(day, hr, min)
          if(obj[accessor].src){
            obj[accessor]={src:"", timeStart:'0:0:0', duration:0}
            removeAllInPeriod(decTime(day, hr, min))
            removeAllInPeriod(incTime(day, hr, min))
          }
        }
        removeAllInPeriod(day, hr, min)
        var numSlotsFilled = Math.ceil(duration/60)
        
        for(var i = 0;i<numSlotsFilled; i++){
          console.log("filling")
          obj[makeAccessStr(day, hr, min)] = {src: file, startTime: `${day}:${hr}:${min}`, duration:duration}
          var newTime = incTime(day, hr, min)
          day = newTime.day
          hr = newTime.hr
          min = newTime.min
        }
        fs.writeFileSync('./tvsrcs.json', JSON.stringify(obj),'utf8')
        res.header('Cache-Control', 'no-cache');
        res.send("WUT")
      })

      //remove all videos in period
      //write to period
      var makeAccessStr = (day, hr, min)=>{
        return `td${req.body.day}h${req.body.hr}m${req.body.min}`
      }

      var decTime = (day, hr, min)=>{
        if(min===0 && hr>0){
          min=59
          if(hr===0){
            hr=23
            if(day===0){
              day=6
            }else{
              day=day-1
            }
          }else{
            hr=hr-1
          }
        }else{
          min=min-1
        }
        return{day, hr, min}
      }
      var incTime = (day, hr, min)=>{
        if(min===59 && hr>0){
          min=0
          if(hr===23){
            hr=0
            if(day===6){
              day=0
            }else{
              day=day+1
            }
          }else{
            hr=hr+1
          }
        }else{
          min=min+1
        }
        return{day, hr, min}
      }
  })

  .get('/schedule', (req, res)=>{
      var obj = JSON.parse(fs.readFileSync('./tvsrcs.json', 'utf8'))
      res.header('Cache-Control', 'no-cache');
      res.json(obj)
  })

  .get('/resetsched', (req, res)=>{
    var obj = {}
    for(var k=0;k<7;k++){
      for (var i=0;i<24;i++){
        for(var j=0;j<60;j++){
          var num = j%3 + 1
          obj[`td${k}h${i}m${j}`] = {src: '', timeStart:{}, duration:0}
        }
      }
    }
    fs.writeFileSync('./tvsrcs.json', JSON.stringify(obj))
    res.send('OK')
  })

  .get('/videos', (req, res)=>{
    var vidlengths = {}
    fs.readdir('./public/videos', {withFileTypes: true}, (err, vids)=>{
      console.log(vids)
      var vidsdata = vids.map(vid=>{
        console.log()
        var prom = ffprobe(`./public/videos/${vid.name}`, { path: ffprobeStatic.path })
        return prom
      })

      Promise.all(vidsdata).then((vidsdata)=>{
        var resp = vidsdata.map((data, i)=>{
          return {src:vids[i].name, duration:data.streams[0].duration}
        })
        console.log("resp", resp)
        res.json(resp)
      })
    })
  })
