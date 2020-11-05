import React, {Component} from 'react'

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dirty: false,
      empty: true,
      fill_time: false,
    }
  }

  componentDidMount() {
    var vid = document.getElementById('vid')

    vid.addEventListener(
      'loadedmetadata',
      metadata => {
        console.log(
          'current progress',
          this.props.progress,
          'vid duration',
          metadata.target.duration,
          'is playing',
          this.props.progress < metadata.target.duration
            ? 'true'
            : 'false filling time'
        )

        if (this.props.progress > metadata.target.duration) {
          this.props.fillTime()
        } else {
          vid.currentTime = this.props.progress
        }
      },
      false
    )

    this.props.getSrc()

    var listener = () => {
      if (!this.state.dirty) {
        this.setState({muted: false, dirty: true}, () => {
          console.log('unmute')
          this.props.toggleMute()
        })
      } else {
        document.removeEventListener('click', listener)
      }
    }

    document.addEventListener('click', listener)

    vid.onended = () => {
      this.setState({empty:true})
      console.log("oneneded")
    }

    // vid.onloadstart=()=>{
    //   this.setState({empty:true})
    //   console.log("onloadstart")

    // }

    vid.onloadeddata=()=>{
      this.setState({empty:false})
      console.log("oncanplay")
    }
  }

  componentDidUpdate(prevProps, prevState) {
    //what happens when im watching mutliple minute video, dont want it interrupted

    //how do you fill in spare seconds? default to channel advertisement?
    var vid = document.getElementById('vid')
    // if(vid.currentTime===0){
    //   console.log("filling time")
    //     this.props.fillTime()
    // }else 
    if(this.props.progress!==Math.round(vid.currentTime)){
      console.log("unsynced, recorrecting...")
      vid.currentTime=this.props.progress
    }
    if (
      this.props.src !== prevProps.src ||
      // this.props.progress !== prevProps.progress ||
      this.state.empty
    ) {
      this.setState({empty: false}, () => {
        vid.src = this.props.src
      })
    }
  }

  render() {
    console.log(this.state.empty)
    return (
      <div>
        <video
          style={{height: '400px'}}
          id="vid"
          src={this.props.src}
          autoPlay
          muted={this.props.mute}
          loop={!this.props.src}
          controls
        />
        {this.state.empty?<div style={{backgroundColor:"blue", height:"200px", width:"200px"}}>FILLER</div>:null}
        <div>Click anywhere for sound</div>
        <button onClick={this.props.getSrc}>resync</button>
        <button onClick={this.props.toggleMute}>mute</button>
      </div>
    )
  }
}
