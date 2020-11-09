import React, {Component} from 'react'

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dirty: false,
      empty: true,
      fill_time: false,
      init_loading:true,
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
    
    vid.onplay = () => {
      console.log("playing")
      this.setState({playing:true, fill_time:false, init_loading:false})
    }

    vid.onended = () => {
      console.log("ended")
      this.setState({fill_time:true, playing:false})
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.socketError && !this.props.socketError){
      this.setState({init_loading:true})
    }

    if(this.props.src==="no source" && (!this.state.fill_time || this.state.init_loading)){
      console.log("no source")
      this.setState({fill_time:true, init_loading:false})
    }

    if(this.props.progress!==Math.round(this.state.vid.currentTime)){
      console.log("unsynced, recorrecting...")
      this.state.vid.currentTime=this.props.progress
    }

    if(this.props.src !== prevProps.src) {
      this.state.vid.src = this.props.src
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
    var hide_main = this.state.fill_time || this.props.src
    var vis1
    var vis2
    var vis3
    var vis4

    if(this.props.socketError){
        vis1="hidden"
        vis2="hidden"  
        vis3="hidden"
    }else{
       vis4="hidden"
      if(this.state.init_loading){
        vis1="hidden"
        vis2="hidden"
      }else{
        if(hide_main){
          vis1="hidden"
        }else{
          vis2="hidden"
        }
        vis3="hidden"
      }
    }


    return (
      <div style={{width:"640px", height:"360px", display:"inline-block", position:"absolute"}}>
          <div id="vidcontainer" className="video-container" style={{display:"grid"}}>
            <img src="/static.gif" style={{width:"100%", height:"100%", gridColumn:"1", gridRow:"1", visibility:vis3}}></img>
            <img src="/no_signal.png" style={{width:"100%", height:"100%", gridColumn:"1", gridRow:"1", visibility:vis4}}></img>
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis1}}
              id="vid"
              src={this.props.src}
              autoPlay
              muted={this.props.mute || hide_main}
              loop={!this.props.src}
              controls={false}
            />
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis2}}
              src="./videos/test3.mp4"
              autoPlay
              muted={true}
              loop={true}
              controls={false}
            />
            <div>
              <button onClick={this.props.toggleMute}>mute</button>
              <button onClick={this.fullscreen}>fullscreen</button>
            </div>
            <div>Click anywhere for sound</div>
          </div>
      </div>
    )
  }
}
