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
      debounce:false,
      mute:true,
      channelJustChanged:false
    }
    this.videoplayer=null
  }

  onYTPlayerReady = (event) => {
    console.log("PLAY VIDEO", this.props.src)
    event.target.mute()
    if(this.props.src && this.props.isYoutubeId){
      console.log("player ready")
      this.videoplayer.loadVideoById(this.props.src, this.props.progress)
    }
    event.target.playVideo();
  }

  onYTPlayerStateChange = (event) => {
    if(event.data==1){
      //is playing
      console.log("yt playing")
      if(this.state.channelJustChanged){
        this.ytSound(!this.state.mute)
      }
      this.setState({playing:true, channelJustChanged:false, fill_time:false, debounce:false, init_loading:false})
    }else if(event.data==3){
      //is buffering
      console.log("yt buffering")
      // this.setState({playing:false, fill_time:false, init_loading:true})

    }else if(event.data==0){
      //has ended
      console.log("yt ended")
      this.setState({fill_time:true, playing:false})
    }
    console.log("player state changed", event.data)
  }

  ytSound = (tf) => {
    tf?this.videoplayer.unMute():this.videoplayer.mute()
  }

  stopYTVideo = () => {
    this.videoplayer.stopVideo();
  }

  playvideo = () => {this.videoplayer.playVideo()}

  componentDidMount() {
    var ytplayer = new YT.Player('player', {
        height: '700',
        width: '640',
        videoId: '',
        events: {
          'onReady': this.onYTPlayerReady,
          'onStateChange': this.onYTPlayerStateChange
        }
      });
    this.videoplayer = ytplayer

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
      if (!this.state.dirty && this.videoplayer.unMute) {
        this.setState({muted: false, dirty: true}, () => {
          console.log('unmute')
          // if(this.videoplayer.unMute){
          //   console.log(this.videoplayer)
          //   this.videoplayer.unMute()
          // }
          this.toggleMute()
        })
      } else if(this.videoplayer.unMute){
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
    console.log(this.state.debounce, this.state.isCasting)
    if(this.state.debounce){return}
    if(this.state.isCasting){return}

    if(prevProps.socketError && !this.props.socketError){
      this.setState({init_loading:true})
    }

    if(this.props.src==="no source" && (!this.state.fill_time || this.state.init_loading && this.props.emitterChannelId == this.props.match.params.channelId)){
      console.log("no source")
      this.setState({fill_time:true, init_loading:false})
    }

    if(this.props.isYoutubeId && this.videoplayer && this.videoplayer.getCurrentTime){
      if(this.props.src && this.props.src!=="no source" && !!this.props.progress && Math.abs(this.props.progress - Math.round(this.videoplayer.getCurrentTime())) > 2){
        if(this.videoplayer.seekTo){
          console.log("seeking")
          this.setState({debounce:true}, ()=>{
            this.videoplayer.seekTo(this.props.progress)
          })
        }
      }
    }else if(!this.props.isYoutubeId){
      if(this.props.src && this.props.src!=="no source" && !!this.props.progress && Math.abs(this.props.progress - Math.round(this.state.vid.currentTime)) > 3){
        console.log("unsynced, recorrecting...  adding debounce")
        this.setState({debounce:true})
        this.state.vid.currentTime=this.props.progress
      }
    }

    if(this.props.src !== prevProps.src) {
        console.log(this.videoplayer, this.props.src, this.props.isYoutubeId)
      if(this.props.isYoutubeId){
        if(this.videoplayer&&this.videoplayer.loadVideoById){
          console.log("trying to play", this.props.src)
          this.videoplayer.loadVideoById(this.props.src, this.props.progress)
        }
      }else{
        this.state.vid.src = this.props.src
      }
    }
    // console.log(this.props.emitterChannelId)
    // if(this.props.emitterChannelId!==prevProps.emitterChannelId){
    //   if(this.videoplayer&&this.videoplayer.loadVideoById){
    //     console.log("trying to load after channel switch")
    //     this.videoplayer.loadVideoById(this.props.src, this.props.progress)
    //   }
    // }
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
    if(this.videoplayer.mute){
      this.videoplayer.mute()
    }
    this.props.incrementChannel()
    this.setState({channelJustChanged:true, init_loading:true})
  }

  downChannel= () => {
    if(this.videoplayer.mute){
      this.videoplayer.mute()
    }
    this.props.decrementChannel()
    this.setState({channelJustChanged:true, init_loading:true})
  }

  toggleMute = () => {
    this.state.mute?this.videoplayer.unMute():this.videoplayer.mute()
    this.setState({mute: !this.state.mute})
  }

  render() {
    var hide_main = this.state.fill_time || !this.props.src
    var vis1
    var vis2
    var vis3
    var vis4
    var vis5
    var vis6
    if(this.state.isCasting){
      vis1="hidden"
      vis2="hidden"
      vis3="hidden"
      vis4="hidden"
      vis6="hidden"
    }else if(this.props.socketError){
      vis1="hidden"
      vis2="hidden"
      vis3="hidden"
      vis5="hidden"
      vis6="hidden"
    }else{
       vis5="hidden"
       vis4="hidden"
      if(this.state.init_loading){
        vis1="hidden"
        vis2="hidden"
        vis6="hidden"
      }else{
        if(hide_main){
          vis1="hidden"
          vis6="hidden"
        }else{
          vis2="hidden"
        }
        if(this.props.isYoutubeId){
          vis1="hidden"
        }else{
          vis6="hidden"
        }
        vis3="hidden"
      }
    }
    var ytheight="700px"
    return (
      <div style={{width:this.props.vidWidth?this.props.vidWidth:"640px", height:"700px", display:"inline-block", position:"absolute", backgroundColor:"yellowgreen"}}>
          <div id="vidcontainer" className="video-container" style={{display:"grid", height:"100%", width:"100%"}}>
            {!this.state.dirty?<Entrance onClick={this.hideCover}/>:null}
            <div style={{visibility:vis6, position:"absolute"}}>
              <div id="topblinder" style={{backgroundColor:"black", height:"90px", width:"640px", position:"absolute", zIndex:"3"}}></div>
              <div id="noclickscreen"n style={{height:"700px", width:"640px", position:"absolute", zIndex:"3"}}></div>
              <div id="botblinder" style={{backgroundColor:"black", height:"200px", width:"640px", top:"530px", position:"absolute", zIndex:"3"}}></div>
              <div id="player" style={{position:"absolute"}}></div>
            </div>
            <img src="/static.gif" style={{width:"100%", height:"360px", gridColumn:"1", gridRow:"1", visibility:vis3, position:"relative", top:"50%", transform: "translateY(-50%)"}}></img>
            <img src="/no_signal.png" style={{width:"100%", height:"360px", gridColumn:"1", gridRow:"1", visibility:vis4, position:"relative", top:"50%", transform: "translateY(-50%)"}}></img>
            <img src="/no_signal.png" style={{width:"100%", height:"360px", gridColumn:"1", gridRow:"1", visibility:vis5, position:"relative", top:"50%", transform: "translateY(-50%)"}}></img>
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis1, margin:0, position:"relative", top:"50%", transform: "translateY(-50%)"}}
              id="vid"
              src={this.props.src}
              autoPlay
              muted={this.state.mute || hide_main || this.state.isCasting || this.state.init_loading}
              loop={!this.props.src}
              controls={false}
              disableremoteplayback="true"
            />
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis2, position:"relative", top:"50%", transform: "translateY(-50%)"}}
              src="/videos/test3.mp4"
              autoPlay
              muted={true}
              loop={true}
              controls={false}
            />
          </div>
          <div style={{backgroundColor:"black", position:"absolute", display:"flex", width:"100%", zIndex:"5", top:"530px"}}>
            <div style={{display:"flex"}}>
              {this.state.mute?<button className="videobutton unmute" onClick={this.toggleMute}></button>:<button className="videobutton mute" onClick={this.toggleMute}></button>}
              <button className="videobutton fullscreen" onClick={this.fullscreen}></button>
              <CastButton socketError={this.props.socketError} segment={this.props.segment} switchPlayer={this.switchPlayer} progress={this.props.progress} src={this.props.src}/>
              <div style={{display:"flex", backgroundColor:"black"}}>
                <button style={{width:"40px", height:"40px", margin:"14px 0 14px 7px"}} onClick={this.upChannel} >c-up</button>
                <button style={{width:"40px", height:"40px", margin:"14px 7px 14px 0"}} onClick={this.downChannel} >c-dn</button>   
              </div>
            </div>
            <div style={{width:"100%", backgroundColor:"black"}}></div>
          </div>
      </div>
    )
  }
}
