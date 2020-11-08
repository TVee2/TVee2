import React, {Component} from 'react'
import VideoPlayer from './VideoPlayer'
import Chat from './Chat'
import axios from 'axios'
import io from 'socket.io-client'
var socket = io()

export default class TV extends Component {
  constructor() {
    super()
    this.state = {src: '', progress: 0, playmargin:null, mute: true, loop: false, socket_error:false}
  }

  componentDidMount() {
    socket.on('emission', segment => {
        if(!segment||!segment.program.src){
          this.setState({src:"no source"})
        }else{
          var src = segment.program.src
          var {progress, playmargin} = segment
          this.setState({src, progress, playmargin})
        }
    })
    socket.on('connect_error', () => {
      this.setState({socket_error:true})
    })
    socket.on('connect', () => {
      this.setState({socket_error:false})
    })
  }

  toggleMute = () => {
    this.setState({mute: !this.state.mute})
  }

  fillTime = () => {
    this.setState({src: './videos/test3.mp4', loop: true})
  }

  render() {
    return (
      <div>
        <VideoPlayer
          src={this.state.src}
          progress={this.state.progress}
          playmargin={this.state.playmargin}
          toggleMute={this.toggleMute}
          socketError={this.state.socket_error}
          mute={this.state.mute}
          fillTime={this.fillTime}
          loop={this.state.loop}
        />
        <Chat 
          {...this.props}
          channelId={1}
        />
      </div>
    )
  }
}
