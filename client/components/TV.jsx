import React, {Component} from 'react'
import obj  from './VideoPlayer'
import Chat from './Chat'
import Entrance from './Entrance'
import axios from 'axios'
import io from 'socket.io-client'
import history from '../history'
import {Link} from 'react-router-dom'
import PixBlock from './pix/components/PixBlock'
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
      showChat:false,
      isYoutubeId:false,
      noChannel:false,
      numViewers:0,
      isFavorite:false,
      channelChanged:false,
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
    this.getAllChannels()
    // this.getNewChannels()
    // this.getFavoriteChannels()
    // this.getHotChannels()

    window.addEventListener('resize', this.updateSize)
    this.getChannel()
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.updateSize)   
  }

  componentWillUnmount() {
    if(this.state.channel){
      socket.emit('roomleave', {channelId: this.state.channel.id, userId:this.props.user.id})
    }
    socket.off()
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

  // getFavoriteChannels = () => {
  //   axios.get('/api/channels/favorites/nonrandom')
  //   .then((res) => {
  //     this.setState({favoriteChannels:res.data})
  //   })
  // }

  // getHotChannels = () => {
  //   axios.get('/api/channels/active')
  //   .then((res) => {
  //     this.setState({hotChannels:res.data})
  //   })
  // }

  // getNewChannels = () => {
  //   axios.get('/api/channels/new')
  //   .then((res) => {
  //     this.setState({newChannels:res.data})
  //   })
  // }

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
    document.cookie = `c=${channelId}`
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
              this.setState({src, channelChanged:false, height:segment.program.height, isYoutubeId, progress, emitterChannelId:this.state.channel.id, segment})
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
        this.setState({channel:[], numViewers:0, channelChanged:false, noChannel:true, defaultSrc:null, showChannelId:false})
      }
    })
    .catch((err) => {
      this.setState({channel:[], numViewers:0, channelChanged:false, noChannel:true, defaultSrc:null, showChannelId:false})
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
    var channelArr = this.state.allChannels
    var key = "selectedAllIndex"
    var channel = this.state.allChannels.find((channel, i) => {
      if(channel.id == this.props.match.params.channelId){
        indexor = i
        return true
      }
    })
    if(indexor!==0 && !indexor){
      this.state.allChannels.find((channel, i) => {
        if(channel.id > parseInt(this.props.match.params.channelId)){
          nextIndex = i - 1
          return true
        }
      })  
    }
    if(!nextIndex && nextIndex !== 0 && indexor!==0 && !indexor){
      nextIndex = this.state.allChannels.length - 1
    }
    if(!nextIndex && nextIndex !== 0){
      if(indexor - 1 < 0){
        nextIndex = channelArr.length - 1
      }else{
        nextIndex = indexor - 1
      }
    }

    var obj = {}
    obj[key] = nextIndex
    this.setState(obj)

    this.changeChannel(channelArr[nextIndex].id)


    // if(selector=="all"){
    //   key = "selectedAllIndex"
    //   indexor = this.state.selectedAllIndex
    //   channelArr = this.state.allChannels
    // }else if(selector=="favorite"){
    //   key = "selectedFavoriteIndex"
    //   indexor = this.state.selectedFavoriteIndex
    //   channelArr = this.state.favoriteChannels
    // }else if(selector=="hot"){
    //   key = "selectedHotChannelIndex"
    //   indexor = this.state.selectedHotChannelIndex
    //   channelArr = this.state.hotChannels
    // }else if(selector=="new"){
    //   key = "selectedNewChannelIndex"
    //   indexor = this.state.selectedNewChannelIndex
    //   channelArr = this.state.newChannels
    // }

    // if(indexor){
    // }else{
    //   nextIndex = channelArr.length - 1 
    // }
  }

  incrementChannel = () => {
    var selector = this.state.selectedFlick
    var nextIndex
    var indexor
    var channelArr = this.state.allChannels
    var key = "selectedAllIndex"
    var channel = this.state.allChannels.find((channel, i) => {
      if(channel.id == this.props.match.params.channelId){
        indexor = i
      }
    })

    if(indexor!==0 && !indexor){
      this.state.allChannels.find((channel, i) => {
        if(channel.id > parseInt(this.props.match.params.channelId)){
          nextIndex = i
          return true
        }
      })  
    }

    if(!nextIndex && nextIndex !== 0 && indexor!==0 && !indexor){
      nextIndex = 0
    }

    if(!nextIndex && nextIndex !== 0){
      if(indexor + 1 > channelArr.length - 1){
        nextIndex = 0
      }else{
        nextIndex = indexor + 1
      }
    }
    var obj = {}
    obj[key] = nextIndex
    this.setState(obj)

    this.changeChannel(channelArr[nextIndex].id)

    // if(selector=="all"){
    //   key = "selectedAllIndex"
    //   indexor = this.state.selectedAllIndex
    //   channelArr = this.state.allChannels
    // }else if(selector=="favorite"){
    //   key = "selectedFavoriteIndex"
    //   indexor = this.state.selectedFavoriteIndex
    //   channelArr = this.state.favoriteChannels
    // }else if(selector=="hot"){
    //   key = "selectedHotChannelIndex"
    //   indexor = this.state.selectedHotChannelIndex
    //   channelArr = this.state.hotChannels
    // }else if(selector=="new"){
    //   key = "selectedNewChannelIndex"
    //   indexor = this.state.selectedNewChannelIndex
    //   channelArr = this.state.newChannels
    // }

    // if(indexor){
    // }else{
    //   var selected = channelArr.findIndex((channel, i) => {return channel.id == parseInt(this.props.match.params.channelId)})
    //   if(selected > 0 || selected == 0){
    //     if(selected + 1 > channelArr.length - 1){
    //       nextIndex = 0
    //     }else{
    //       nextIndex = selected + 1
    //     }
    //   }else{
    //     nextIndex = 0
    //   }
    // }
  }

  changeChannel = (id) => {
    if(this.state.channelChanged){
      return
    }
    history.push(`/tv/${id}`)
    if(this.state.channel){
      socket.emit('roomleave', {channelId: this.state.channel.id, userId:this.props.user.id})
    }
    socket.off()
    this.setState({channel:null, segment:null, channelChanged:true, numViewers:0, src:'', defaultSrc:''}, () => {
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

  toggleChat = () => {
    this.setState({showChat:!this.state.showChat})
  }

  render() {
    let smallwindow=false
    if(window.innerWidth<=1000 || screen.width<=1000){
      smallwindow = true
    }

    var height
    var ratio
    if(this.state.height == 360){
      //height is actually 480
      ratio = 3/4
      if(window.innerWidth<640){
        height = `${window.innerWidth*ratio}px`
      }else{
        height = "480px"
      }

    }else{
      //height is 360
      ratio = 9/16
      if(window.innerWidth<640){
        height = `${window.innerWidth*ratio}px`
      }else{
        height = "360px"
      }
    }

    return (
      <div>
        {smallwindow?<button style={{position:"absolute", zIndex:"11", right:"25px", top:"65px"}} onClick={this.toggleChat}>{`${this.state.showChat?">":"<"}`} Chat</button>:null}
        <div>
          <Chat
            smallwindow={smallwindow}
            showChat={this.state.showChat}
            {...this.props}
            getComments={this.getComments}
            comments={this.state.comments}
            channelId={this.props.match.params.channelId}
          />
          {this.props.showCover?<Entrance/>:null}
          <div style={{height:"25px", width:"100%", backgroundColor:"white"}}></div>
          <div id="blockSpaceholder" style={{height:height, maxWidth:"640px", width:"100%", margin:window.innerWidth<700?"0":"0 25px"}}>
            <div id="absoluteWrapper" style={{height:height, maxWidth:"640px", width:"100%", position:"absolute"}}>
              <VideoPlayer
                channel={this.state.channel}
                noChannel={this.state.noChannel}
                showCover={this.props.showCover}
                removeCover={this.props.removeCover}
                dirty={this.props.dirty}
                muted={this.props.muted}
                toggleParentStateMuted={this.props.toggleParentStateMuted}
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
                user={this.props.user}
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
                  <div style={{overflow:"hidden"}}><a href={`https://www.youtube.com/watch?v=${this.state.segment.program.youtubeId}`}>{`youtube.com/watch?v=${this.state.segment.program.youtubeId}`}</a></div>
                </div>
              :
                <div style={{margin:window.innerWidth<700?"0":"0 4px 0 0", minHeight:"150px", display:"inline-block", padding:"10px", border:"solid black 2px", backgroundColor:"yellowgreen", width:window.innerWidth<700?"100%":"316px"}}>
                  {this.state.channelChanged?<div style={{margin:"10px"}}>Loading Program</div>:<div style={{margin:"10px"}}>No current channel programming</div>}
                </div>
              }
                <div style={{margin:window.innerWidth<700?"0":"0 0 0 4px", maxWidth:"640px", minHeight:"190px", display:"inline-block", padding:"10px", border:"solid black 2px", backgroundColor:"magenta", width:window.innerWidth<700?"100%":"316px"}}>
                  {this.state.channel&&this.state.channel.playlist?
                    <div>
                      <div>This Playlist:</div>
                      <div>{this.state.channel.playlist.title}</div>
                      <img src={this.state.channel.playlist.thumbnailUrl}></img>
                      <div style={{overflow:"hidden"}}><a href={`https://www.youtube.com/playlist?list=${this.state.channel.playlist.youtubeId}`}>{`youtube.com/playlist?list=${this.state.channel.playlist.youtubeId}`}</a></div>
                    </div>
                  :null}
                </div>
            </div>
            {this.state.channel && this.state.channel.user?
              <div style={{margin: window.innerWidth<700?"0":"0 25px", minHeight:"100px", maxWidth:"640px", border:"solid black 2px"}}>
                <div style={{margin:"10px"}}>{this.state.channel.name.toUpperCase()}</div>
                {this.state.channel.description?<div style={{margin:"10px"}}>Description: {this.state.channel.description}</div>:null}
                {this.state.channel.hashtags.length?<div style={{margin:"10px"}}>Tags: {this.state.channel.hashtags.map((h) => {return <span style={{border:"solid black 2px"}}> {`${h.tag}`} </span>})}</div>:null}
                <span>
                  <Link to={`/users/${this.state.channel.user.id}`} style={{margin:"10px"}}> {this.state.channel.user.profilePix?<PixBlock pix={this.state.channel.user.profilePix} dim={16} adgrab={`channel${this.state.channel.id}`}/>:<img style={{height:"16px", width:"16px"}} src="/icons/userico.png"></img>} {this.state.channel.user.username}</Link>
                </span>
              </div>
            :null}
          </div>
        </div>
      </div>
    )
  }
}
