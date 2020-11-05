import React, {Component} from 'react'
import VideoPlayer from './VideoPlayer'
import axios from 'axios'
import io from 'socket.io-client'
var socket = io()

export default class TV extends Component {
  constructor() {
    super()
    this.state = {src: 'null', progress: 0, mute: true, loop: false}
  }

  componentDidMount() {
    // socket.emit('pix', 'test payload')
    socket.on('emission', segment => {
      // this.getSrc()
      var src = segment.program.src
      var progress = segment.progress
      this.setState({src, progress})
    })
  }

  getSrc = () => {
    axios
      .get('/api/src')
      .then(res => res.data)
      .then(data => {
        console.log('got data', data)
        this.setState({progress: data.progress, src: data.src, loop: false})
      })
  }

  toggleMute = () => {
    console.log('mute?', !this.state.mute)
    this.setState({mute: !this.state.mute})
  }

  fillTime = () => {
    this.setState({src: './videos/test3.mp4', loop: true})
  }

  render() {
    return (
      <div>
        <VideoPlayer
          getSrc={this.getSrc}
          src={this.state.src}
          progress={this.state.progress}
          toggleMute={this.toggleMute}
          mute={this.state.mute}
          fillTime={this.fillTime}
          loop={this.state.loop}
        />
      </div>
    )
  }
}
