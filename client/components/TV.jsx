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
      channel:null,
      progress: null,
      init_loading:true,
      mute: true,
      loop: false,
      socket_error:false,
      comments:[],
      emitterChannelId:null,
      showCover:true
    }
  }

  componentDidMount() {
    this.getChannel()
  }

  toggleMute = () => {
    this.setState({mute: !this.state.mute})
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
      this.setState({channel:res.data, showChannelId:true}, () => {
        setTimeout(() => {
          this.setState({showChannelId:false})
        }, 1500)
        socket.on(this.state.channel.id, segment => {
          if(!segment||!segment.program||!segment.program.videos.length===0||!segment.program.videos[0].path){
            this.setState({src:"no source", emitterChannelId:this.state.channel.id,})
          }else{
            var src = segment.program.videos[0].path
            var {progress} = segment
            this.setState({src, progress, emitterChannelId:this.state.channel.id, segment})
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
        div.scrollTop = div.scrollHeight - div.clientHeight;
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

  hideCover = () => {
    this.setState({showCover:false})
  }

  render() {
    return (
      <div>
        {this.state.showChannelId?
          <div style={{position:"absolute", color:"greenyellow", zIndex:"2", fontSize:"64px", margin:"15px"}}>
            {this.props.match.params.channelId}
          </div>
        :null}
        <VideoPlayer
          match={this.props.match}
          src={this.state.src}
          progress={this.state.progress}
          toggleMute={this.toggleMute}
          socketError={this.state.socket_error}
          mute={this.state.mute}
          loop={this.state.loop}
          segment={this.state.segment}
          emitterChannelId={this.state.emitterChannelId}
          incrementChannel={this.incrementChannel}
          decrementChannel={this.decrementChannel}
        />
        <Chat
          {...this.props}
          getComments={this.getComments}
          comments={this.state.comments}
          channelId={this.props.match.params.channelId}
        />
      </div>
    )
  }
}
