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

var buildPlaylistItems = async(items, playlist_instance) => {
  for(var j = 0;j<items.length;j++){
    var item = items[j].vid
    if(!item){
      continue
    }
    var position = parseInt(items[j].snippet.position)

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
}

buildPlaylistAndGetItems = async (playlistId, user, seedDuration) => {
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
  var playlist_obj = {title:playlist_title, youtubeId:playlistId, description:playlist_description, isYoutubePlaylist:true, thumbnailUrl, userId: user.id}
  
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
  var add = []
  var cumulative_duration = 0

  while(parseInt(totalResults)>thumbedResults){
    var items_new_meta = []
    for(var i = 0;i<items_meta.items.length;i++){
      var yid = items_meta.items[i].snippet.resourceId.videoId
      const yvid = await youtube.videos.list({
        part: 'status, contentDetails, snippet, player',
        id: yid
      });
      if(yvid.data.items.length==0){
        console.log("unable to obtain item, private or restricted")
        continue
      }
      items_meta.items[i].vid = yvid.data.items[0]
    }

    if(seedDuration){
      add = items_meta.items.filter((item)=>{cumulative_duration = cumulative_duration + parseDuration(item.vid); return cumulative_duration < seedDuration})
    }else{
      add = items_meta.items
    }
    items = items.concat(add)

    if(totalResults<=thumbedResults || cumulative_duration > seedDuration){
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

  return {playlist_obj, items}
}

module.exports.uploadOrUpdatePlaylist = async (playlistYoutubeId, playlistInstanceId, user) => {
  var playlist_instance
  var playlistId
  try{
    if(!playlistYoutubeId && !playlistInstanceId){
      throw new Error("no parameters given")
    }
    if(playlistInstanceId){
      playlist_instance = await Playlist.findByPk(playlistInstanceId) 
      if(!playlist_instance){
          throw new Error("no playlist instance found")
      }
      if(playlistYoutubeId){
        playlistId = playlistYoutubeId
      }else{
        playlistId = playlist_instance.youtubeId
      }
      var {playlist_obj, items} = await buildPlaylistAndGetItems(playlistId, user)
      await playlist_instance.update(playlist_obj)
      await PlaylistItem.destroy({where:{playlistId:playlist_instance.id}})
    }else{

      playlistId = playlistYoutubeId
      var {playlist_obj, items} = await buildPlaylistAndGetItems(playlistId, user)
      playlist_instance = await Playlist.create(playlist_obj)
    }

    return buildPlaylistItems(items, playlist_instance) 
  }catch(err){
    console.log(err)
  }
}

module.exports.uploadOrUpdateChannelPlaylist = async (youtubeChannelId, playlistInstanceId, user, seedDuration) => {
  var playlistId
  var playlist_instance
  try{
    if(!youtubeChannelId && !playlistInstanceId){
      throw new Error("no parameters given")
    }
    if(playlistInstanceId){
      playlist_instance = await Playlist.findByPk(playlistInstanceId) 
      if(!playlist_instance){
        throw new Error("no playlist instance found")
      }
      if(youtubeChannelId){
        playlistId = youtubeChannelId
      }else{
        playlistId = playlist_instance.youtubeId
      }
      var {playlist_obj, items} = await buildPlaylistAndGetItems(playlistId, user, seedDuration)
      await playlist_instance.update(playlist_obj)
      await PlaylistItem.destroy({where:{playlistId:playlist_instance.id}})
    }else{
      var channel_meta = await youtube.channels.list({
        part: 'status, contentDetails, snippet',
        id: youtubeChannelId
      })
      var channel_item = channel_meta.data.items[0]
      if(!channel_item){
        throw new Error("channel may be set to private")
      }
      playlistId = channel_item["contentDetails"]["relatedPlaylists"]["uploads"]
      var {playlist_obj, items} = await buildPlaylistAndGetItems(playlistId, user, seedDuration)
      playlist_instance = await Playlist.create(playlist_obj)
    }

    return buildPlaylistItems(items, playlist_instance)
  }catch(err){
    console.log(err)
  }
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
