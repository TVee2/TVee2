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
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(!prevProps.src && this.props.src && this.state.fill_time){
      this.setState({fill_time:false})
    }

    if(this.props.progress!==Math.round(this.state.vid.currentTime)){
      console.log("unsynced, recorrecting...")
      this.state.vid.currentTime=this.props.progress
    }
    if (
      this.props.src !== prevProps.src ||
      // this.props.progress !== prevProps.progress ||
      this.state.empty
    ) {
      this.setState({empty: false}, () => {
        this.state.vid.src = this.props.src
      })
    }
  }

  render() {
    var hide_main = this.props.playmargin
    var vis1 = this.props.playmargin?"hidden":null
    var vis2 = !this.props.playmargin?"hidden":null
    var ord1 = hide_main?2:1
    var ord2 = !hide_main?2:1

    return (
      <div>
        {!this.props.socketError?
          <div className="video-container" style={{display:"flex", flexDirection:"column"}}>
            <video
              style={{height: '400px', visibility:vis1, order:ord1}}
              id="vid"
              src={this.props.src}
              autoPlay
              muted={this.props.mute}
              loop={!this.props.src}
              controls
            />
            <video
              style={{height: '400px', visibility:vis2, order:ord2}}
              src="./videos/test3.mp4"
              autoPlay
              muted={true}
              loop={true}
              controls
            />
          </div>
        :<h3>Captain, we've lost contact with the mothership!</h3>}
        <div>Click anywhere for sound</div>
        <button onClick={this.props.getSrc}>resync</button>
        <button onClick={this.props.toggleMute}>mute</button>
      </div>
    )
  }
}
