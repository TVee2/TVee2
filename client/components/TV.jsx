import React, {Component} from 'react'
import obj  from './VideoPlayer'
import Chat from './Chat'
import Entrance from './Entrance'
import axios from 'axios'
import io from 'socket.io-client'
import history from '../history'
import {Link} from 'react-router-dom'
var VideoPlayer = obj.VideoPlayer
var socket = io()

export default class TV extends Component {
  constructor() {
    super()
    this.state = {
      segment:null,
      currentChannelId:null,
      nextChannelId:null,
      prevChannelId:null,
      showChannelId:false,
      src: '',
      defaultSrc:null,
      channel:null,
      progress: null,
      init_loading:true,
      mute: true,
      loop: false,
      socket_error:false,
      comments:[],
      emitterChannelId:null,
      showCover:true,
      collapse:false,
      showChat:false,
      vidWidth:null,
      isYoutubeId:false,
      noChannel:false,
      numViewers:0,
      isFavorite:false,

      allChannels:[],
      selectedAllIndex:0,
      favoriteChannels:[],
      selectedFavoriteIndex:null,
      hotChannels:[],
      selectedHotChannelIndex:null,
      newChannels:[],
      selectedNewChannelIndex:null,
      flickColor:"greenyellow",
      selectedFlick: "all",
      relatedChannels:[],
    }
    this.interval=null
  }

  componentDidMount() {
    this.getNewChannels()
    this.getAllChannels()
    this.getFavoriteChannels()
    this.getHotChannels()

    this.getChannel()
    if(window.innerWidth<=1000 || screen.width<=1000){
      this.setState({collapse:true})
    }
    if(window.innerWidth <= 640 || screen.width <= 640){
      var width
      if(window.innerWidth < screen.width){
        width=window.innerWidth
      }else{
        width=screen.width
      }
      this.setState({vidWidth:width})
    }

    window.addEventListener("resize", this.resizeListener, false)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeListener, false)
    if(this.state.channel){
      socket.emit('roomleave', {channelId: this.state.channel.id, userId:this.props.user.id})
    }
    socket.off()
  }

  resizeListener = () => {
    if(window.innerWidth>=1000){
      this.setState({collapse:false})
    }
    if(window.innerWidth<1000 || screen.width<1000){
      this.setState({collapse:true})
    }
    if(window.innerWidth<=640 || screen.width<=640){
      var width
      if(window.innerWidth < screen.width){
        width=window.innerWidth
      }else{
        width=screen.width
      }
      this.setState({vidWidth:width})
    }else{
      this.setState({vidWidth:null})
    }   
  }


  getRelatedChannels = () => {
    if(!this.state.channel.id){
      return
    }
    axios.get(`/api/channels/related/${this.state.channel.id}`)
    .then((ret) => {
      this.setState({relatedChannels:ret.data})
    })
  }

  flickChange = (selector) => {
    var color = ""
    if(selector=="all"){
      color = "greenyellow"
    }else if(selector=="favorite"){
      color = "yellow"
    }else if(selector=="hot"){
      color = "magenta"
    }else if(selector=="new"){
      color = "cyan"      
    }
    this.setState({selectedFlick:selector, flickColor:color})
  }

  getAllChannels = () => {
    axios.get('/api/channels')
    .then((res) => {
      this.setState({allChannels:res.data})
    })
  }

  getFavoriteChannels = () => {
    axios.get('/api/channels/favorites/nonrandom')
    .then((res) => {
      this.setState({favoriteChannels:res.data})
    })
  }

  getHotChannels = () => {
    axios.get('/api/channels/active')
    .then((res) => {
      this.setState({hotChannels:res.data})
    })
  }

  getNewChannels = () => {
    axios.get('/api/channels/new')
    .then((res) => {
      this.setState({newChannels:res.data})
    })
  }

  getCurrentChannelIsFavorite = () => {
    axios.get(`/api/channels/isfavorite/${this.state.channel.id}`)
    .then((res) => {
      this.setState({isFavorite:res.data.isFavorite})
    })
  }

  getChannel = (channelId) => {
    if(!channelId){
      channelId = this.props.match.params.channelId
    }
    this.getComments(channelId)
    axios.get(`/api/channels/${channelId}`)
    .then((res) => {
      var channel = res.data.channel
      var numViewers = res.data.numViewers
      if(channel){
        var defaultSrc = channel.defaultProgram?channel.defaultProgram.youtubeId:""
        this.setState({channel, numViewers, noChannel:false, defaultSrc, showChannelId:true}, () => {
          this.getRelatedChannels()
          this.getCurrentChannelIsFavorite()
          if(this.interval){
            clearTimeout(this.interval)
          }
          this.interval = setTimeout(() => {
            this.setState({showChannelId:false})
            this.interval=null
          }, 1500)
          socket.on(this.state.channel.id, segment => {
            var src
            var isYoutubeId = false
            if(segment&&segment.program&&segment.program.youtubeId){
              isYoutubeId = true
              src = segment.program.youtubeId
              var {progress} = segment
              this.setState({src, height:segment.program.height, isYoutubeId, progress, emitterChannelId:this.state.channel.id, segment})
            }else if(!segment||!segment.program||!segment.program.youtubeId){
              this.setState({src:"no source", emitterChannelId:this.state.channel.id,})
            }
          })
          socket.on(`c${this.state.channel.id}`, comment => {
            this.setState({comments: [comment, ...this.state.comments]}, () => {
              var div = document.getElementById("commentcontainer");
              div.scrollTop = div.scrollHeight - div.clientHeight;
            })
          })
          socket.on('connect_error', () => {
            this.setState({socket_error:true, src:'', progress:0})
          })
          socket.on('connect', () => {
            this.setState({socket_error:false})
          })
          socket.emit('roomenter', {channelId: channel.id, userId:this.props.user.id})
        })
      }else{
        this.setState({noChannel:true})
      }
    })
    .catch((err) => {
      console.log(err)
    })
  }

  getComments = (channelId) => {
    if(!channelId){
      channelId = this.props.match.params.channelId
    }
    axios.get(`/api/comments?channelId=${channelId}`)
    .then((res) => {
      this.setState({comments:res.data}, () => {
        var div = document.getElementById("commentcontainer");
        if(div){
          div.scrollTop = div.scrollHeight - div.clientHeight;
        }
      })
    })
    .catch((err) => {
      console.log(err)
    })
  }

  nextChannelId = () => {
    var this_channel_id = parseInt(this.props.match.params.channelId)
    var chan_length = this.props.channels.length
    var next_channel_id
    if(this_channel_id===chan_length){
      next_channel_id = 1
    }else{
      next_channel_id = this_channel_id + 1
    }
    return next_channel_id
  }

  prevChannelId = () => {
    var this_channel_id = parseInt(this.props.match.params.channelId)
    var chan_length = this.props.channels.length
    var prev_channel_id
    if(this_channel_id===1){
      prev_channel_id = chan_length
    }else{
      prev_channel_id = this_channel_id - 1
    }
    return prev_channel_id
  }

  decrementChannel = () => {
    var selector = this.state.selectedFlick
    var nextIndex
    var indexor
    var channelArr
    var key
    if(selector=="all"){
      key = "selectedAllIndex"
      indexor = this.state.selectedAllIndex
      channelArr = this.state.allChannels
    }else if(selector=="favorite"){
      key = "selectedFavoriteIndex"
      indexor = this.state.selectedFavoriteIndex
      channelArr = this.state.favoriteChannels
    }else if(selector=="hot"){
      key = "selectedHotChannelIndex"
      indexor = this.state.selectedHotChannelIndex
      channelArr = this.state.hotChannels
    }else if(selector=="new"){
      key = "selectedNewChannelIndex"
      indexor = this.state.selectedNewChannelIndex
      channelArr = this.state.newChannels
    }

    if(indexor){
      if(indexor - 1 < 0){
        nextIndex = channelArr.length - 1
      }else{
        nextIndex = indexor - 1
      }
    }else{
      nextIndex = channelArr.length - 1 
    }

    var obj = {}
    obj[key] = nextIndex
    this.setState(obj)

    this.changeChannel(channelArr[nextIndex].id)
  }

  incrementChannel = () => {
    var selector = this.state.selectedFlick
    var nextIndex
    var indexor
    var channelArr
    var key


    if(selector=="all"){
      key = "selectedAllIndex"
      indexor = this.state.selectedAllIndex
      channelArr = this.state.allChannels
    }else if(selector=="favorite"){
      key = "selectedFavoriteIndex"
      indexor = this.state.selectedFavoriteIndex
      channelArr = this.state.favoriteChannels
    }else if(selector=="hot"){
      key = "selectedHotChannelIndex"
      indexor = this.state.selectedHotChannelIndex
      channelArr = this.state.hotChannels
    }else if(selector=="new"){
      key = "selectedNewChannelIndex"
      indexor = this.state.selectedNewChannelIndex
      channelArr = this.state.newChannels
    }

    if(indexor){
      if(indexor + 1 > channelArr.length - 1){
        nextIndex = 0
      }else{
        nextIndex = indexor + 1
      }
    }else{
      var selected = channelArr.findIndex((channel, i) => {return channel.id == parseInt(this.props.match.params.channelId)})
      if(selected > 0 || selected == 0){
        if(selected + 1 > channelArr.length - 1){
          nextIndex = 0
        }else{
          nextIndex = selected + 1
        }
      }else{
        nextIndex = 0
      }
    }
    var obj = {}
    obj[key] = nextIndex
    this.setState(obj)

    this.changeChannel(channelArr[nextIndex].id)
  }

  changeChannel = (id) => {
    history.push(`/tv/${id}`)
    if(this.state.channel){
      socket.emit('roomleave', {channelId: this.state.channel.id, userId:this.props.user.id})
    }
    socket.off()
    this.setState({channel:null, numViewers:0, src:'', defaultSrc:''}, () => {
      this.getChannel(id) 
    })
  }

  hideCover = () => {
    this.setState({showCover:false})
  }

  addFavorite = () => {
    axios.post(`/api/channels/favorites/add/${this.state.channel.id}`)
    .then(() => {
      this.getCurrentChannelIsFavorite()
    })
  }

  removeFavorite = () => {
    axios.post(`/api/channels/favorites/remove/${this.state.channel.id}`)
    .then(() => {
      this.getCurrentChannelIsFavorite()
    })
  }

  render() {
    let width = window.innerWidth;
    let smallwindow=false
    if(width<1000){
      smallwindow=true
    }

    var botheight
    var height
    if(this.state.height == 360){
      //height is actually 480
      height = "480px"
      if(window.innerWidth<425){
        botheight = "632px"
      }else if(window.innerWidth<700){
        botheight = "620px"
      }else{
        botheight = "650px"
      }
    }else{
      //height is 360
      height = "360px"
      if(window.innerWidth<425){
        botheight = "523px"
      }else if(window.innerWidth<700){
        botheight = "488px"
      }else{
        botheight = "535px"
      }
    }

    return (
      <div>
        {smallwindow?<button style={{position:"absolute", zIndex:"11", right:"25px", top:"72px"}} onClick={() => {this.setState({showChat:!this.state.showChat})}}>{`${this.state.showChat?">":"<"}`} Chat</button>:null}
        <div>
          <Chat
            smallwindow={smallwindow}
            showChat={this.state.showChat}
            collapse={this.state.collapse}
            {...this.props}
            getComments={this.getComments}
            comments={this.state.comments}
            channelId={this.props.match.params.channelId}
          />
          {this.props.showCover?<Entrance/>:null}
          <div style={{height:"25px", width:"100%", backgroundColor:"white"}}></div>
          <div id="blockSpaceholder" style={{height:height, width:this.state.vidWidth?this.state.vidWidth:"640px", margin:window.innerWidth<700?"0":"0 25px"}}>
            <div id="absoluteWrapper" style={{height:height, width:this.state.vidWidth?this.state.vidWidth:"640px", position:"absolute"}}>
              <VideoPlayer
                channel={this.state.channel}
                noChannel={this.state.noChannel}
                showCover={this.props.showCover}
                removeCover={this.props.removeCover}
                dirty={this.props.dirty}
                muted={this.props.muted}
                toggleParentStateMuted={this.props.toggleParentStateMuted}
                vidWidth={this.state.vidWidth}
                match={this.props.match}
                src={this.state.src}
                defaultSrc={this.state.defaultSrc}
                isYoutubeId={this.state.isYoutubeId}
                progress={this.state.progress}
                socketError={this.state.socket_error}
                mute={this.state.mute}
                loop={this.state.loop}
                segment={this.state.segment}
                emitterChannelId={this.state.emitterChannelId}
                incrementChannel={this.incrementChannel}
                decrementChannel={this.decrementChannel}
                changeChannel={this.changeChannel}
                numViewers={this.state.numViewers}
                isFavorite={this.state.isFavorite}
                addFavorite={this.addFavorite}
                removeFavorite={this.removeFavorite}
                segment={this.state.segment}
                showChannelId={this.state.showChannelId}
                allChannels={this.state.allChannels}
                favoriteChannels={this.state.favoriteChannels}
                hotChannels={this.state.hotChannels}
                newChannels={this.state.newChannels}
                selectedAllIndex={this.state.selectedAllIndex}
                selectedFavoriteIndex={this.state.selectedFavoriteIndex}
                selectedHotChannelIndex={this.state.selectedHotChannelIndex}
                selectedNewChannelIndex={this.state.selectedNewChannelIndex}
                flickColor={this.state.flickColor}
                selectedFlick={this.state.selectedFlick}
                flickChange={this.flickChange}
                socket={socket}
                getChannel={this.getChannel}
                relatedChannels={this.state.relatedChannels}
                height={height}
              />
            </div>
          </div>
          <div style={{backgroundColor:"white", minHeight:"400px", paddingTop:window.innerWidth<700?"32px":"62px"}}>
            <div style={{width:"100%", maxWidth:"640px", display:window.innerWidth<700?"":"flex", zIndex:"5", margin:window.innerWidth<700?"0":"0 25px", padding:window.innerWidth<700?"0":"10px 0"}}>
              {this.state.segment && this.state.segment.program?
                <div style={{margin:window.innerWidth<700?"0":"0 4px 0 0", minHeight:"150px", display:"inline-block", padding:"10px", border:"solid black 2px", backgroundColor:"yellowgreen", width:window.innerWidth<700?"100%":"316px"}}>
                  <div>Now Playing:</div>
                  <div>{this.state.segment.program.title}</div>
                  <img src={this.state.segment.program.thumbnailUrl}></img>
                  <div><a href={`https://www.youtube.com/watch?v=${this.state.segment.program.youtubeId}`}>{`youtube.com/watch?v=${this.state.segment.program.youtubeId}`}</a></div>
                </div>
              :
                <div style={{margin:window.innerWidth<700?"0":"0 4px 0 0", minHeight:"150px", display:"inline-block", padding:"10px", border:"solid black 2px", backgroundColor:"yellowgreen", width:window.innerWidth<700?"100%":"316px"}}>
                  <div style={{margin:"10px"}}>No current channel programming</div>
                </div>
              }
                <div style={{margin:window.innerWidth<700?"0":"0 0 0 4px", maxWidth:"640px", minHeight:"190px", display:"inline-block", padding:"10px", border:"solid black 2px", backgroundColor:"magenta", width:window.innerWidth<700?"100%":"316px"}}>
                  {this.state.channel?
                    <div>
                      <div>This Playlist:</div>
                      <div>{this.state.channel.playlist.title}</div>
                      <img src={this.state.channel.playlist.thumbnailUrl}></img>
                      <div style={{overflow:"hidden"}}><a href={`https://www.youtube.com/playlist?list=${this.state.channel.playlist.youtubeId}`}>{`youtube.com/playlist?list=${this.state.channel.playlist.youtubeId}`}</a></div>
                    </div>
                  :null}
                </div>
            </div>
            <div style={{margin: window.innerWidth<700?"0":"0 25px", minHeight:"100px", maxWidth:"640px", border:"solid black 2px"}}>
              {this.state.channel?<div style={{margin:"10px"}}>{this.state.channel.name.toUpperCase()}</div>:null}
              {this.state.channel&&this.state.channel.description?<div style={{margin:"10px"}}>Description: {this.state.channel.description}</div>:null}
              {this.state.channel&&this.state.channel.hashtags.length?<div style={{margin:"10px"}}>Tags: {this.state.channel.hashtags.map((h) => {return <span style={{border:"solid black 2px"}}> {`${h.tag}`} </span>})}</div>:null}
              {this.state.channel?<Link to={`/users/${this.state.channel.user.id}`} style={{margin:"10px"}}>By: {this.state.channel.user.username}</Link>:null}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
