const router = require('express').Router()
const {Playlist, PlaylistItem} = require('../db/models')
module.exports = router

const {google} = require('googleapis');
const youtube = google.youtube('v3');
const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/youtube'],
});
google.options({auth});

router.get('/', async (req, res, next) => {
  var userId = req.user.id
  try {
    const playlists = await Playlist.findAll({
      where:{userId},
      order:[['createdAt', 'DESC']],
      include:{model: PlaylistItem}
    })
    res.json(playlists)
  } catch (err) {
    next(err)
  }
})

.post('/ytplaylist/:plid', async (req, res, next) => {
  try {
    var playlist_meta = await youtube.playlists.list({
      part: 'status, contentDetails, snippet',
      id: req.params.plid
    })
    if(!playlist_meta.data.items[0]){
      return res.json({message:"playlist may be set to private"})
    }
    var playlist = playlist_meta.data.items[0].snippet
    var playlist_title = playlist.title
    var playlist_description = playlist.description
    var thumbnailUrl = playlist.thumbnails.default.url

    var items_meta = await youtube.playlistItems.list({
      part: 'status, contentDetails, snippet',
      playlistId: req.params.plid
    })

    items_meta = items_meta.data
    var totalResults = items_meta.pageInfo.totalResults
    var resultsPerPage = items_meta.pageInfo.resultsPerPage
    var thumbedResults = 0
    var items = []
    var nextPageToken = items_meta.nextPageToken

    while(parseInt(totalResults)>thumbedResults){
      items = items.concat(items_meta.items)
      if(!totalResults>thumbedResults){
        break
      }
      ret = await youtube.playlistItems.list({
        part: 'status, contentDetails, snippet',
        playlistId: req.params.plid,
        pageToken: nextPageToken
      })
      items_meta = ret.data
      nextPageToken = items_meta.nextPageToken
      thumbedResults = thumbedResults + parseInt(resultsPerPage)
    }

    var new_playlist = await Playlist.create({title:playlist_title, description:playlist_description, isYoutubePlaylist:true, thumbnailUrl, userId:req.user.id})
    for(var j = 0;j<items.length;j++){
      var yid = items[j].snippet.resourceId.videoId
      var position = parseInt(items[j].snippet.position)
      const yvid = await youtube.videos.list({
        part: 'status, contentDetails, snippet, player',
        id: yid
      });
      if(yvid.data.items.length==0){
        console.log("unable to obtain item, private or restricted")
        continue
      }
      var item = yvid.data.items[0]
      var embedHtml = item.player.embedHtml
      var matchwidth = "width=\""
      var matchlength = "height=\""
      var widthindex = embedHtml.indexOf(matchwidth)+matchwidth.length
      var heightindex = embedHtml.indexOf(matchlength)+matchlength.length
      var width = embedHtml.slice(widthindex, widthindex+3)
      var height = embedHtml.slice(heightindex, heightindex+3)

      var obj = {}
      var arr = []
      var str = item.contentDetails.duration

      let n = str.length;
      let duration = 0;
      let curr = 0;
      for(let i=0; i<n; i++){
        if(str[i] == 'P' || str[i] == 'T')
        {}
        else if(str[i] == 'H')
        {
          duration = duration + 3600*curr;
          curr = 0;
        }
        else if(str[i] == 'M')
        {

          duration = duration + 60*curr;
          curr = 0;
        }
        else if(str[i] == 'S')
        {
          duration = duration + curr;
          curr = 0;
        }
        else
        {
          curr = 10*curr + parseInt(str[i]);
        }
      }

      var embeddable = item.status.embeddable
      var countryCode = 'US'

      if(item && item.contentDetails && item.contentDetails.regionRestriction && item.contentDetails.regionRestriction.blocked){
        embeddable = !item.contentDetails.regionRestriction.blocked.includes(countryCode) && embeddable
      }

      var title = item.snippet.title
      var thumbnailUrl = item.snippet.thumbnails.default.url
      var playlistItem
      if(item.kind=="youtube#video"){     
        playlistItem = await PlaylistItem.create({
          playlistId: new_playlist.id,
          position,
          ytVideoId: item.id,
          duration,
          thumbnailUrl,
          embeddable,
          title,
          playableVideo:true,
          width,
          height,
        })
      }else{
        playlistItem = await PlaylistItem.create({
          playlistId: new_playlist.id,
          position,
          ytVideoId: item.id,
          duration,
          thumbnailUrl,
          embeddable,
          title,
          width,
          height,
          playableVideo:false,
        })
      }
    }
    //should create a playlist and all contents
    res.json(new_playlist)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  var userId = req.user.id
  try {
    const playlist = await Playlist.findOne({
      where:{id:req.params.id, userId}
    })
    await playlist.destroy()
    res.json({action:"playlist deleted"})
  } catch (err) {
    next(err)
  }
})
