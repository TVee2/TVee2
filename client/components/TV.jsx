import React, {Component} from 'react'
import VideoPlayer from './VideoPlayer'
import Chat from './Chat'
import axios from 'axios'
import io from 'socket.io-client'
var socket = io()

export default class TV extends Component {
  constructor() {
    super()
    this.state = {src: '', channel:null, progress: 0, init_loading:true, mute: true, loop: false, socket_error:false, comments:[]}
  }

  componentDidMount() {
    this.getChannel()
    socket.on('comment', comment => {
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
  }

  toggleMute = () => {
    this.setState({mute: !this.state.mute})
  }

  componentWillUnmount() {
    socket.off()
  }

  getChannel = () => {
    axios.get(`/api/channels/${this.props.match.params.channelId}`)
    .then((res) => {
      this.setState({channel:res.data}, () => {
        socket.on(this.state.channel.name, segment => {
          if(!segment||!segment.program||!segment.program.videos.length===0||!segment.program.videos[0].path){
            this.setState({src:"no source"})
          }else{
            var src = segment.program.videos[0].path
            var {progress} = segment
            this.setState({src, progress})
          }
        })
      })
    })
    .catch((err) => {
      console.log(err)
    })
  }

  getComments = () => {
    axios.get(`/api/comments?channel=${this.props.match.params.channelId}`)
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

  render() {
    return (
      <div>
        <VideoPlayer
          src={this.state.src}
          progress={this.state.progress}
          toggleMute={this.toggleMute}
          socketError={this.state.socket_error}
          mute={this.state.mute}
          loop={this.state.loop}
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
