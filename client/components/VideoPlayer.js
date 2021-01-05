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
      channelJustChanged:false,
      showKeypad:false,
      controlChannelOnChange:"",
    }
    this.videoplayer=null
    this.defaultVideoPlayer=null
  }

  onYTPlayerReady = (event) => {
    event.target.mute()
    if(this.props.src && this.props.isYoutubeId){
      console.log("player ready")
      this.videoplayer.loadVideoById(this.props.src, this.props.progress)
    }
    if(!this.props.showCover){
      this.ytSound(true)
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
    }else if(event.data==-1){
      this.setState({playing:false, fill_time:true})
    }
    console.log("player state changed", event.data)
  }

  onDefaultPlayerReady = (event) => {
    event.target.mute()

    if(this.props.defaultSrc){
      console.log("default player ready")
      event.target.loadVideoById(this.props.defaultSrc)
    }
    console.log(this.props.defaultSrc)
    event.target.playVideo();
  }

  onDefaultPlayerStateChange = (e) => {
    console.log("INVOKED", e.data)
    if (e.data == 0) {
      this.defaultVideoPlayer.playVideo(); 
    }
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

    var defaultPlayer = new YT.Player('timefiller', {
        height: '700',
        width: '640',
        videoId: '',
        events: {
          'onReady': this.onDefaultPlayerReady,
          'onStateChange': this.onDefaultPlayerStateChange
        }
      });

    this.videoplayer = ytplayer
    this.defaultVideoPlayer = defaultPlayer

    // var vid = document.getElementById('vid')
    // this.setState({vid})

    // vid.addEventListener(
    //   'loadedmetadata',
    //   metadata => {
    //     console.log(
    //       'current progress',
    //       this.props.progress,
    //       'vid duration',
    //       metadata.target.duration,
    //       'is playing',
    //       this.props.progress < metadata.target.duration
    //         ? 'true'
    //         : 'false filling time'
    //     )

    //     if (this.props.progress > metadata.target.duration) {
    //       this.props.fillTime()
    //     } else {
    //       vid.currentTime = this.props.progress
    //     }
    //   },
    //   false
    // )

    var listener = () => {
      if (!this.state.dirty && this.videoplayer.unMute) {
        this.props.removeCover()
        this.setState({muted: false, dirty: true}, () => {
          console.log('unmute')

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

    if(this.props.defaultSrc !== prevProps.defaultSrc) {
      if(this.defaultVideoPlayer&& this.defaultVideoPlayer.loadVideoById){
      console.log("default src is here", this.props.defaultSrc)
        this.defaultVideoPlayer.loadVideoById(this.props.defaultSrc)
      }
    }

    if(this.props.src !== prevProps.src) {
      if(this.props.isYoutubeId){
        if(this.videoplayer&&this.videoplayer.loadVideoById){
          console.log("trying to play", this.props.src)
          this.videoplayer.loadVideoById(this.props.src, this.props.progress)
        }
      }else{
        // this.state.vid.src = this.props.src
      }
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

  switchChannel= () => {
    if(this.videoplayer.mute){
      this.videoplayer.mute()
    }
    var new_channel = document.getElementById("channelchange").value
    this.props.changeChannel(new_channel)
    this.setState({channelJustChanged:true, controlChannelOnChange:"", init_loading:true})
  }

  toggleMute = () => {
    this.state.mute?this.videoplayer.unMute():this.videoplayer.mute()
    this.setState({mute: !this.state.mute})
  }

  channelInputOnChange = (e) => {
    const re = /^[0-9\b]+$/
    if ((e.target.value === '' || re.test(e.target.value)) && e.target.value.length<6) {
      this.setState({controlChannelOnChange:e.target.value})
    }
  }

  render() {
    var isFullscreen
    if(document.fullscreenElement|| document.webkitFullscreenElement || document.mozFullScreenElement){
      isFullscreen=true
    }else{
      isFullscreen=false
    }
    var hide_main = this.state.fill_time || !this.props.src

    var vis1 = "hidden"
    var vis2 = "hidden"
    var vis3 = "hidden"
    var vis4 = "hidden"
    var vis5 = "hidden"
    var vis6 = "hidden"
    var vis7 = "hidden"
    var vis8 = "hidden"

    if(this.props.noChannel){
      vis8=""
    }else if(this.state.isCasting){
      vis5=""
    }else if(this.props.socketError){
      vis4=""
    }else if(this.state.init_loading){
      vis3=""
    }else if(hide_main){
      if(this.props.defaultSrc){
        vis2=""
      }else{
        vis7=""
      }
    }else if(this.props.isYoutubeId){
      vis6=""
    }else{
      vis1=""
    }

    // <div id="topblinder" style={{backgroundColor:"black", height:"90px", width:"100%", position:"absolute", zIndex:"3"}}></div>
    return (
      <div style={{top:"-22px", width:this.props.vidWidth?this.props.vidWidth:"640px", height:"700px", display:"inline-block", position:"absolute", backgroundColor:"black"}}>
          <div id="vidcontainer" className="video-container" style={{display:"grid", height:"100%", width:"100%"}}>
            {this.props.showCover?<Entrance/>:null}
            <div style={{visibility:vis6, position:"absolute", height:"100%", width:"100%"}}>
              <div id="noclickscreen" style={{height:"100%", width:"100%", position:"absolute", zIndex:"3"}}></div>
              <div id="player" style={{position:"absolute", width:"100%", height:"160%", top:"-30%"}}></div>
            </div>
            <div id="botblinder" style={{backgroundColor:isFullscreen?"":"white", height:"320px", width:"100%", top:"600px", position:"absolute", zIndex:"3"}}></div>
            <img src="/static.gif" style={{width:"100%", height:isFullscreen?"100%":"360px", gridColumn:"1", gridRow:"1", visibility:vis3, position:"relative", top:"50%", transform: "translateY(-50%)"}}></img>
            <img src="/no_signal.png" style={{width:"100%", height:isFullscreen?"100%":"360px", gridColumn:"1", gridRow:"1", visibility:vis4, position:"relative", top:"50%", transform: "translateY(-50%)"}}></img>
            <img src="/no_signal.png" style={{width:"100%", height:isFullscreen?"100%":"360px", gridColumn:"1", gridRow:"1", visibility:vis5, position:"relative", top:"50%", transform: "translateY(-50%)"}}></img>
            <img src="/no_channel.png" style={{width:"100%", height:isFullscreen?"100%":"360px", gridColumn:"1", gridRow:"1", visibility:vis8, position:"relative", top:"50%", transform: "translateY(-50%)"}}></img>
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
            <div style={{visibility:vis2, position:"absolute", height:"100%", width:"100%"}}>
              <div id="timefiller"></div>
            </div>
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis7, position:"relative", top:"50%", transform: "translateY(-50%)"}}
              src="/videos/test3.mp4"
              autoPlay
              muted={true}
              loop={true}
              controls={false}
            />
          </div>
          <div style={{backgroundColor:"black", position:"absolute", display:"flex", width:"100%", zIndex:"5", top:"530px", height:"70px"}}>
            <div style={{display:"flex"}}>
              {this.state.mute?<button className="videobutton unmute" onClick={this.toggleMute}></button>:<button className="videobutton mute" onClick={this.toggleMute}></button>}
              <button className="videobutton fullscreen" onClick={this.fullscreen}></button>
              <CastButton socketError={this.props.socketError} segment={this.props.segment} switchPlayer={this.switchPlayer} progress={this.props.progress} src={this.props.src}/>
              <div style={{display:"flex", backgroundColor:"black"}}>
                <button className = "upchannel" style={{imageRendering:"pixelated", backgroundSize:"cover", width:"40px", height:"40px", margin:"14px 0 14px 7px"}} onClick={this.upChannel} ></button>
                <button className = "downchannel" style={{imageRendering:"pixelated", backgroundSize:"cover", width:"40px", height:"40px", margin:"14px 7px 14px 0"}} onClick={this.downChannel} ></button>   
                <button className = "keypad" style={{imageRendering:"pixelated", backgroundSize:"cover", width:"40px", height:"40px", margin:"14px 7px 14px 7px"}} onClick={()=>{this.setState({showKeypad:!this.state.showKeypad})}} ></button>   
                <div style={{visibility:this.state.showKeypad?"":"hidden", width:"180px"}}><input value={this.state.controlChannelOnChange} id="channelchange" onChange={this.channelInputOnChange} style={{fontSize:"30px", display:"inline-block", height:"33px", width:"100px", margin:"14px 2px 14px 7px"}}></input><button onClick={this.switchChannel} style={{display:"inline-block", height:"40px", margin:"14px 7px 14px 0", verticalAlign:"super"}}>Go</button></div>
              </div>
            </div>
            <div style={{width:"100%", backgroundColor:"black"}}></div>
          </div>
      </div>
    )
  }
}
