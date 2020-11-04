var CronJob = require('cron').CronJob;
const tvsrcs = require('../tvsrcs.json')

module.exports = (io)=>{

  io.on('connection', function (socket) {
    console.log("connection has been made")
    socket.on('message', function (data) {
      socket.broadcast.emit('message', data);
    });
    var prevtag = ''
    new CronJob('* * * * * *', function() {
      var now = new Date()
      var day = now.getDay()
      var hour = now.getHours()
      var min = now.getMinutes()
      var srctag =`td${day}h${hour}m${min}`
      var currsrc = tvsrcs[srctag].src
      var prevsrc = tvsrcs[prevtag]?tvsrcs[prevtag].src:null

      if(new Date().getSeconds()===0 && currsrc!=prevsrc){
        console.log('get new src emitted');
        prevtag=srctag
        socket.broadcast.emit('message', 'getnewsrc')
      }
    }, null, true, 'America/Chicago');

  });
}
