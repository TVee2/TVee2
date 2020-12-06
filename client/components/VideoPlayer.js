import React, {Component} from 'react'
import CastButton from './CastButton'
import Entrance from './Entrance'

export default class VideoPlayer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dirty: false,
      empty: true,
      fill_time: false,
      init_loading:true,
      vid:null,
      isCasting:false,
      debounce:false
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

    vid.oncanplaythrough= () => {console.log("oncanplaythrough - remove debounce"); this.setState({debounce:false})}


    vid.onended = () => {
      console.log("ended")
      this.setState({fill_time:true, playing:false})
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.debounce){return}

    if(prevProps.socketError && !this.props.socketError){
      this.setState({init_loading:true})
    }

    if(this.props.src==="no source" && (!this.state.fill_time || this.state.init_loading && this.props.emitterChannelId == this.props.match.params.channelId)){
      console.log("no source")
      this.setState({fill_time:true, init_loading:false})
    }

    if(this.props.src && this.props.src!=="no source" && Math.abs(this.props.progress - Math.round(this.state.vid.currentTime)) > 3 && !!this.props.progress){
      console.log("unsynced, recorrecting...  adding debounce")
      this.setState({debounce:true})
      this.state.vid.currentTime=this.props.progress
    }

    if(this.props.src !== prevProps.src) {
      this.state.vid.src = this.props.src
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

  switchPlayer = () => {console.log("switching player"); this.setState({isCasting:!this.state.isCasting})}

  upChannel= () => {
    this.props.incrementChannel()
    this.setState({init_loading:true})
  }

  downChannel= () => {
    this.props.decrementChannel()
    this.setState({init_loading:true})
  }

  render() {
    var hide_main = this.state.fill_time || !this.props.src
    var vis1
    var vis2
    var vis3
    var vis4
    var vis5
    if(this.state.isCasting){
      vis1="hidden"
      vis2="hidden"
      vis3="hidden"
      vis4="hidden"
    }else if(this.props.socketError){
      vis1="hidden"
      vis2="hidden"
      vis3="hidden"
      vis5="hidden"
    }else{
       vis5="hidden"
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
      <div style={{width:this.props.vidWidth?this.props.vidWidth:"640px", display:"inline-block", position:"absolute", backgroundColor:"black"}}>
          <div id="vidcontainer" className="video-container" style={{display:"grid"}}>
            {!this.state.dirty?<Entrance onClick={this.hideCover}/>:null}
            <img src="/static.gif" style={{width:"100%", height:"100%", gridColumn:"1", gridRow:"1", visibility:vis3}}></img>
            <img src="/no_signal.png" style={{width:"100%", height:"100%", gridColumn:"1", gridRow:"1", visibility:vis4}}></img>
            <img src="/no_signal.png" style={{width:"100%", height:"100%", gridColumn:"1", gridRow:"1", visibility:vis5}}></img>
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis1, margin:0, position:"absolute", top:"50%", transform: "translateY(-50%)"}}
              id="vid"
              src={this.props.src}
              autoPlay
              muted={this.props.mute || hide_main || this.state.isCasting || this.state.init_loading}
              loop={!this.props.src}
              controls={false}
              disableremoteplayback
            />
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis2}}
              src="/videos/test3.mp4"
              autoPlay
              muted={true}
              loop={true}
              controls={false}
            />
            <div style={{backgroundColor:"white"}}>
              {this.props.mute?<button className="videobutton unmute" onClick={this.props.toggleMute}></button>:<button className="videobutton mute" onClick={this.props.toggleMute}></button>}
              <button className="videobutton fullscreen" onClick={this.fullscreen}></button>
              <div>
                <button onClick={this.upChannel} >channel up</button>
                <button onClick={this.downChannel} >channel down</button>   
              </div>
              <CastButton socketError={this.props.socketError} segment={this.props.segment} switchPlayer={this.switchPlayer} progress={this.props.progress} src={this.props.src}/>
            </div>
            <div style={{backgroundColor:"white"}}>Click anywhere for sound</div>
          </div>
      </div>
    )
  }
}
