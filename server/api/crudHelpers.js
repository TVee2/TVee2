const {User, Channel, Playlist, Timeslot, Segment, PlaylistItem, Program} = require('../db/models')

const {google} = require('googleapis');
const youtube = google.youtube('v3');
const auth = new google.auth.GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/youtube'],
});
google.options({auth});

parseDuration = (item) => {
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
  return duration
}

module.exports.uploadProgram = async (youtubeId, user) => {
  const yvid = await youtube.videos.list({
    part: 'status, contentDetails, snippet',
    id: youtubeId
  });

  var item = yvid.data.items[0]
  if(!item){
    throw new Error("Video doesnt exist or is set to private")
  }

  var embeddable = item.status.embeddable
  if(!embeddable){
    return res.json({err:"Not embeddable or set to private"});
  }
  try{
    var duration = parseDuration(item)
    var title = item.snippet.title
    var thumbnailUrl = item.snippet.thumbnails.default.url
    var program = await Program.create({title, duration, youtubeId, thumbnailUrl, userId:user.id})
    return program
  }catch(err){
    throw new Error(err)
  }
}

// module.exports.uploadPlaylist = async (playlistId, user) => {
//   try{

//     var playlist_meta = await youtube.playlists.list({
//       part: 'status, contentDetails, snippet',
//       id: playlistId
//     })
//     var playlist_item = playlist_meta.data.items[0]
//     if(!playlist_item){
//       throw new Error("playlist may be set to private")
//     }

//     var playlist = playlist_item.snippet
//     var playlist_title = playlist.title
//     var playlist_description = playlist.description
//     var thumbnailUrl = playlist.thumbnails.default.url

//     var items_meta = await youtube.playlistItems.list({
//       part: 'status, contentDetails, snippet',
//       playlistId: playlistId
//     })

//     items_meta = items_meta.data
    
//     var totalResults = items_meta.pageInfo.totalResults
//     if(!parseInt(totalResults)){
//       throw new Error("playlist does not contain items")
//     }
//     var resultsPerPage = items_meta.pageInfo.resultsPerPage
//     var thumbedResults = 0
//     var items = []
//     var nextPageToken = items_meta.nextPageToken

//     while(parseInt(totalResults)>thumbedResults){
//       items = items.concat(items_meta.items)
//       if(!totalResults>thumbedResults){
//         break
//       }
//       ret = await youtube.playlistItems.list({
//         part: 'status, contentDetails, snippet',
//         playlistId: playlistId,
//         pageToken: nextPageToken
//       })
//       items_meta = ret.data
//       nextPageToken = items_meta.nextPageToken
//       thumbedResults = thumbedResults + parseInt(resultsPerPage)
//     }

//     var new_playlist = await Playlist.create({title:playlist_title, youtubeId:playlistId, description:playlist_description, isYoutubePlaylist:true, thumbnailUrl, userId: user.id})
//     for(var j = 0;j<items.length;j++){
//       var yid = items[j].snippet.resourceId.videoId
//       var position = parseInt(items[j].snippet.position)
//       const yvid = await youtube.videos.list({
//         part: 'status, contentDetails, snippet, player',
//         id: yid
//       });
//       if(yvid.data.items.length==0){
//         console.log("unable to obtain item, private or restricted")
//         continue
//       }
//       var item = yvid.data.items[0]
//       var embedHtml = item.player.embedHtml
//       var matchwidth = "width=\""
//       var matchlength = "height=\""
//       var widthindex = embedHtml.indexOf(matchwidth)+matchwidth.length
//       var heightindex = embedHtml.indexOf(matchlength)+matchlength.length
//       var width = embedHtml.slice(widthindex, widthindex+3)
//       var height = embedHtml.slice(heightindex, heightindex+3)

//       var duration = parseDuration(item)

//       var embeddable = item.status.embeddable
//       var countryCode = 'US'

//       if(item && item.contentDetails && item.contentDetails.regionRestriction && item.contentDetails.regionRestriction.blocked){
//         embeddable = !item.contentDetails.regionRestriction.blocked.includes(countryCode) && embeddable
//       }

//       var title = item.snippet.title
//       var thumbnailUrl = item.snippet.thumbnails.default.url
//       var playlistItem
//       var playableVideo

//       if(item.kind=="youtube#video"){
//         playableVideo = true
//       }else{
//         playableVideo = false
//         embeddable = false
//       }

//       playlistItem = await PlaylistItem.create({
//         playlistId: new_playlist.id,
//         position,
//         youtubeId: item.id,
//         duration,
//         thumbnailUrl,
//         embeddable,
//         title,
//         playableVideo,
//         width,
//         height,
//       })
//     }
//     return new_playlist
//   }catch(err){
//     console.log(err)
//   }
// }

module.exports.updateOrUploadPlaylists = async (playlistYoutubeId, user, playlistInstanceId) => {
  try{
    var playlist_instance
    var playlistId

    if(playlistInstanceId){
      playlist_instance = await Playlist.findByPk(playlistInstanceId)
      if(!playlist_instance){
        console.log("no playlist instance found")
        return
      }
      playlistId = playlist_instance.youtubeId
    }else{
      playlistId = playlistYoutubeId
    }

    var playlist_meta = await youtube.playlists.list({
      part: 'status, contentDetails, snippet',
      id: playlistId
    })
    var playlist_item = playlist_meta.data.items[0]
    if(!playlist_item){
      throw new Error("playlist may be set to private")
    }

    var playlist = playlist_item.snippet
    var playlist_title = playlist.title
    var playlist_description = playlist.description
    var thumbnailUrl = playlist.thumbnails.default.url

    var items_meta = await youtube.playlistItems.list({
      part: 'status, contentDetails, snippet',
      playlistId: playlistId
    })

    items_meta = items_meta.data
    
    var totalResults = items_meta.pageInfo.totalResults
    if(!parseInt(totalResults)){
      throw new Error("playlist does not contain items")
    }
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
        playlistId: playlistId,
        pageToken: nextPageToken
      })
      items_meta = ret.data
      nextPageToken = items_meta.nextPageToken
      thumbedResults = thumbedResults + parseInt(resultsPerPage)
    }

    if(playlist_instance){
      await playlist_instance.update({title:playlist_title, youtubeId:playlistId, description:playlist_description, isYoutubePlaylist:true, thumbnailUrl, userId: user.id})
      await PlaylistItem.destroy({where:{playlistId:playlist_instance.id}})
    }else{
      playlist_instance = await Playlist.create({title:playlist_title, youtubeId:playlistId, description:playlist_description, isYoutubePlaylist:true, thumbnailUrl, userId: user.id})
    }

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

      var duration = parseDuration(item)

      var embeddable = item.status.embeddable
      var countryCode = 'US'

      if(item && item.contentDetails && item.contentDetails.regionRestriction && item.contentDetails.regionRestriction.blocked){
        embeddable = !item.contentDetails.regionRestriction.blocked.includes(countryCode) && embeddable
      }

      var title = item.snippet.title
      var thumbnailUrl = item.snippet.thumbnails.default.url
      var playlistItem
      var playableVideo

      if(item.kind=="youtube#video"){
        playableVideo = true
      }else{
        playableVideo = false
        embeddable = false
      }

      playlistItem = await PlaylistItem.create({
        playlistId: playlist_instance.id,
        position,
        youtubeId: item.id,
        duration,
        thumbnailUrl,
        embeddable,
        title,
        playableVideo,
        width,
        height,
      })
    }
    return playlist_instance
  }catch(err){
    console.log(err)
  }
}
