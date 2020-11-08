import React, {Component} from 'react'

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dirty: false,
      empty: true,
      fill_time: false,
      vid:null
    }
  }

  componentDidMount() {
    var vid = document.getElementById('vid')
    this.setState({vid})

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
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.props.src==="no source" && !this.state.fill_time){
      console.log("no source")
      this.setState({fill_time:true})
    }

    if((!prevProps.src || prevProps.src==="no source") && this.props.src && this.props.src!=="no source" && this.state.fill_time){
      console.log("was no src, now have src")
      this.setState({fill_time:false})
    }

    if(this.props.progress!==Math.round(this.state.vid.currentTime)){
      console.log("unsynced, recorrecting...")
      console.log(this.props.progress)
      this.state.vid.currentTime=this.props.progress
    }

    if (
      this.props.src !== prevProps.src ||
      this.state.empty
    ) {
      this.setState({empty: false}, () => {
        this.state.vid.src = this.props.src
      })
    }
  }

  fullscreen=()=>{
    var elem = document.getElementById("vidcontainer")
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }

  render() {
    var hide_main = this.props.playmargin || this.state.fill_time
    var vis1 = hide_main?"hidden":null
    var vis2 = !hide_main?"hidden":null
    var ord1 = hide_main?2:1
    var ord2 = !hide_main?2:1

    return (
      <div style={{width:"600px"}}>
        {!this.props.socketError?
          <div id="vidcontainer" className="video-container" style={{display:"grid"}}>
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis1, order:ord1}}
              id="vid"
              src={this.props.src}
              autoPlay
              muted={this.props.mute || hide_main}
              loop={!this.props.src}
              controls
            />
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis2, order:ord2}}
              src="./videos/test3.mp4"
              autoPlay
              muted={true}
              loop={true}
              controls
            />
          </div>
        :<h3>Captain, we've lost contact with the mothership!</h3>}
        <div>Click anywhere for sound</div>
        <button onClick={this.props.toggleMute}>mute</button>
        <button onClick={this.fullscreen}>fullscreen</button>

      </div>
    )
  }
}
