import React, {Component} from 'react'
import VideoPlayer from './VideoPlayer'
import Chat from './Chat'
import Entrance from './Entrance'
import axios from 'axios'
import io from 'socket.io-client'
import history from '../history'

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
      isYoutubeId:false
    }
    this.interval=null
  }

  componentDidMount() {
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
    window.addEventListener("resize", () => {
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
    });
  }

  componentWillUnmount() {
    socket.off()
  }

  getChannel = (channelId) => {
    if(!channelId){
      channelId = this.props.match.params.channelId
    }
    this.getComments(channelId)
    axios.get(`/api/channels/${channelId}`)
    .then((res) => {
      var channel = res.data
      if(channel){
        this.setState({channel, defaultSrc:channel.defaultSrc, showChannelId:true}, () => {
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
            if(segment&&segment.program&&segment.program.ytVideoId){
              isYoutubeId = true
              src = segment.program.ytVideoId
              var {progress} = segment
              this.setState({src, isYoutubeId, progress, emitterChannelId:this.state.channel.id, segment})

            }else if(!segment||!segment.program||!segment.program.videos.length===0||(!segment.program.videos[0].path&&!segment.program.videos[0].youtubeId)){
              this.setState({src:"no source", emitterChannelId:this.state.channel.id,})
            }else{
              var video = segment.program.videos[0]
              if(video.path){
                src = video.path
              }else if(video.youtubeId){
                src = video.youtubeId
                isYoutubeId = true
              }
              var {progress} = segment
              this.setState({src, isYoutubeId, progress, emitterChannelId:this.state.channel.id, segment})
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
        })
      }else{

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

  incrementChannel = () => {
    var nextChannel = this.nextChannelId()
    history.push(`/tv/${nextChannel}`)
    socket.off()
    this.getChannel(nextChannel)
  }

  decrementChannel = () => {
    var prevChannel = this.prevChannelId()
    history.push(`/tv/${prevChannel}`)
    socket.off()
    this.getChannel(prevChannel)
  }

  changeChannel = (id) => {
    history.push(`/tv/${id}`)
    socket.off()
    this.getChannel(id) 
  }

  hideCover = () => {
    this.setState({showCover:false})
  }

  render() {

    let width = window.innerWidth;
    let smallwindow=false
    if(width<1000){
      smallwindow=true
    }

    return (
      <div>
        {smallwindow?<button style={{position:"absolute", zIndex:"11", right:"25px", top:"115px"}} onClick={() => {this.setState({showChat:!this.state.showChat})}}>{`${this.state.showChat?">":"<"}`} Chat</button>:null}
        <div>
          {this.state.showChannelId?
            <div style={{position:"absolute", color:"greenyellow", zIndex:"2", fontSize:"64px", margin:"15px"}}>
              {this.props.match.params.channelId}
            </div>
          :null}
          <VideoPlayer
            showCover={this.props.showCover}
            removeCover={this.props.removeCover}
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
          />
          <Chat
            smallwindow={smallwindow}
            showChat={this.state.showChat}
            collapse={this.state.collapse}
            {...this.props}
            getComments={this.getComments}
            comments={this.state.comments}
            channelId={this.props.match.params.channelId}
          />
          <div style={{position:"absolute", zIndex:"5", backgroundColor:"yellowgreen", top:"600px", height:"300px", width:"315px"}}></div>
          <div style={{position:"absolute", zIndex:"5", backgroundColor:"magenta", top:"600px", left:"320px", height:"300px", width:"315px"}}></div>

        </div>
      </div>
    )
  }
}
