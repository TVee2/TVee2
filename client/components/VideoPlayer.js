import React, { Component } from 'react'

export default class VideoPlayer extends Component {
  constructor(props){
    super(props)
    this.state={
      dirty:false,
      empty:false
    }
  }

  componentDidMount() {
    var vid = document.getElementById("vid")

    vid.addEventListener('loadedmetadata', (metadata) => {
      console.log("current progress", this.props.progress, "vid duration", metadata.target.duration, "is playing", this.props.progress < metadata.target.duration?"true":"false filling time")

      if(this.props.progress > metadata.target.duration){
        this.props.fillTime()
      }else{
        vid.currentTime = this.props.progress;
      }
      
    }, false);
    
    this.props.getSrc()

    var listener = () => {
      if(!this.state.dirty){
        this.setState({muted:false, dirty:true}, ()=>{
          console.log("unmute")
          this.props.toggleMute()
        })
      } else {
        document.removeEventListener('click', listener)
      }
    }

    document.addEventListener('click', listener);

    vid.onended = () => {
      this.setState({empty:true}, ()=>{
        this.props.fillTime()
      })
    };

  }

  componentDidUpdate(prevProps, prevState) {

    //what happens when im watching mutliple minute video, dont want it interrupted

    //how do you fill in spare seconds? default to channel advertisement?



    if(this.props.src!==prevProps.src || this.props.progress!==prevProps.progress || this.state.empty){
      this.setState({empty:false}, ()=>{
        var vid = document.getElementById("vid")
        console.log(this.props)
        vid.src = this.props.src
      })
    }
  }

  render() {

    return (
      <div >
        <video style={{height:"400px"}} id="vid" src={this.props.src} autoPlay muted={this.props.mute} loop={this.props.loop} controls></video>
        <div>Click anywhere for sound</div>
        <button onClick={this.props.getSrc}>resync</button>
        <button onClick={this.props.toggleMute}>mute</button>
      </div>
    )
  }
}
