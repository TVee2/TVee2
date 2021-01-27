import React, {Component} from 'react'
import CastButton from './CastButton'
import Entrance from './Entrance'
import axios from 'axios'

var Ytplayer = {player:null}

var isMobile = () => {if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    return true
  }else{
    return false
  }
}

class VideoPlayer extends Component {
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
      vidStatus:null,
      relatedChannels:[],
    }
    this.videoplayer=null
    this.defaultVideoPlayer=null
  }

  onYTPlayerReady = (event) => {
    event.target.mute()
    if(this.props.src && this.props.isYoutubeId){
      console.log("player ready w src")
      this.videoplayer.loadVideoById(this.props.src, this.props.progress)
    }
    if(!this.props.muted){
      this.ytSound(true)
    }
    event.target.playVideo();
  }

  onYTPlayerStateChange = (event) => {
    this.setState({vidStatus:event.data})
    if(event.data==1){
      //is playing
      console.log("yt playing", this.props.src, this.props.progress)
      if(this.state.channelJustChanged){
        this.ytSound(!this.props.muted)
      }
      this.setState({playing:true, channelJustChanged:false, fill_time:false, debounce:false, init_loading:false})
    }else if(event.data==3){
      //is buffering
      console.log("yt buffering")
    }else if(event.data==0){
      //has ended
      console.log("yt ended")
      this.setState({fill_time:true, playing:false})
    }else if(event.data==-1){
      this.setState({playing:false, fill_time:true})
    }else if(event.data==2){
      console.log("paused")
    }
  }

  onDefaultPlayerReady = (event) => {
    event.target.mute()

    if(this.props.defaultSrc){
      console.log("default player ready")
      event.target.loadVideoById(this.props.defaultSrc)
    }
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
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === 'visible') {
        if(isMobile()){
          //get channel
          this.channelChangeAppearanceUpdate()
          this.props.getChannel()
        }
      } else {
        if(isMobile()){
          //turn off socket
          if(this.state.channel){
            this.props.socket.emit('roomleave', {channelId: this.props.channel.id, userId:this.props.user.id})
          }
          this.props.socket.off()
        }
      }
    });
    window['__onGCastApiAvailable'] = (isAvailable) => {
      if (isAvailable) {
        this.setState({castAvailable:true})
      }
    };

    var ytplayer = new YT.Player('player', {
        events: {
          'onReady': this.onYTPlayerReady,
          'onStateChange': this.onYTPlayerStateChange
        }
      });

    var defaultPlayer = new YT.Player('timefiller', {
        events: {
          'onReady': this.onDefaultPlayerReady,
          'onStateChange': this.onDefaultPlayerStateChange
        }
      });

    this.videoplayer = ytplayer
    Ytplayer.player = ytplayer
    this.defaultVideoPlayer = defaultPlayer
    
    this.getRelatedChannels()

    // var listener = () => {
    //   if (!this.state.dirty && this.videoplayer.unMute) {
    //     this.props.removeCover()
    //     this.setState({muted: false, dirty: true}, () => {
    //       console.log('unmute')
    //       this.toggleMute()
    //     })
    //   } else if(this.videoplayer.unMute){
    //     document.removeEventListener('click', listener)
    //   }
    // }

    // document.addEventListener('click', listener)
    
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

    if(this.props.isYoutubeId && this.state.vidStatus==1 && this.videoplayer && this.videoplayer.getCurrentTime){
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
          this.getRelatedChannels()
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

  d = () => {console.log("switching player"); this.setState({isCasting:!this.state.isCasting})}

  upChannel= () => {
    this.channelChangeAppearanceUpdate()
    this.props.incrementChannel()
  }

  downChannel= () => {
    this.channelChangeAppearanceUpdate()
    this.props.decrementChannel()
  }

  switchChannel= () => {
    var new_channel = document.getElementById("channelchange").value
    if(new_channel){
      this.channelChangeAppearanceUpdate()
      this.props.changeChannel(new_channel)
    }
  }

  clickChannel = (id) => {
    this.channelChangeAppearanceUpdate()
    this.props.changeChannel(id)
  }

  channelElem = (channel) => {return (
    <div style={{margin:"10px", cursor:"pointer", border:"solid black 2px", padding:"5px"}} onClick = {this.clickChannel.bind(this, channel.id)}>
      <div>{channel.id} - {channel.name}</div>
      <img style = {{margin:"10px"}} src={channel.thumbnailUrl}></img>
    </div>
  )}

  channelChangeAppearanceUpdate = () => {
    if(this.videoplayer.mute){
      this.videoplayer.mute()
    }
    this.setState({channelJustChanged:true, controlChannelOnChange:"", init_loading:true})
    this.getRelatedChannels()
  }

  getRelatedChannels = () => {
    if(!this.props.channel){
      return
    }
    axios.get(`/api/channels/related/${this.props.channel.id}`)
    .then((ret) => {
      this.setState({relatedChannels:ret.data})
    })
  }

  toggleMute = () => {
    console.log(this.props.muted)
    this.props.muted?this.videoplayer.unMute():this.videoplayer.mute()
    this.props.toggleParentStateMuted()
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

    var height
    if(this.props.segment && this.props.segment.program){
      height = this.props.segment.program.height
    }
    if(height=="360"){
      document.getElementById("static").style.height = "480px"
      document.getElementById("static").style.top = "58.6%"
      document.getElementById("player").style.top = "-21.4%"
    }else if(height){
      document.getElementById("static").style.height = "360px"
      document.getElementById("static").style.top = "50%"
      document.getElementById("player").style.top = "-30%"
    }

    return (
      <div style={{top:"-73px", margin:window.innerWidth<700?"0":"0 25px", width:this.props.vidWidth?this.props.vidWidth:"640px", height:"700px", display:"inline-block", position:"absolute", backgroundColor:"black"}}>
          {this.props.showChannelId?
            <div style={{position:"absolute", color:this.props.flickColor, zIndex:"2", fontSize:"64px", top:"175px", left:"25px"}}>
              {this.props.match.params.channelId}
            </div>
          :null}
          <div id="vidcontainer" className="video-container" style={{display:"grid", height:"100%", width:"100%"}}>
            <img src="/static.gif" id="static" style={{width:"100%", height:isFullscreen?"100%":"360px", gridColumn:"1", gridRow:"1", visibility:vis3, position:"absolute", top:"50%", transform: "translateY(-50%)"}}></img>
            {this.props.showCover?<Entrance/>:null}
            <div style={{visibility:vis6, position:"absolute", height:"100%", width:"100%"}}>
              <div id="noclickscreen" style={{height:"100%", width:"100%", position:"absolute", zIndex:"3"}}></div>
              <div id="player" style={{position:"absolute", width:"100%", height:"160%", top:"-30%"}}></div>
            </div>
            <div id="topblinder" style={{backgroundColor:isFullscreen?"":"white", top:"137px", height:"33px", width:"100%", position:"absolute", zIndex:"3"}}></div>
            <div id="botblinder" style={{backgroundColor:isFullscreen?"":"white", width:"100%", height:"320px", top:height=="360"?"660px":"600px", position:"absolute", zIndex:"3"}}></div>
            <img src="/no_signal.png" style={{width:"100%", height:isFullscreen?"100%":"360px", gridColumn:"1", gridRow:"1", visibility:vis4, position:"absolute", top:"50%", transform: "translateY(-50%)"}}></img>
            <img src="/no_signal.png" style={{width:"100%", height:isFullscreen?"100%":"360px", gridColumn:"1", gridRow:"1", visibility:vis5, position:"absolute", top:"50%", transform: "translateY(-50%)"}}></img>
            <img src="/no_channel.png" style={{width:"100%", height:isFullscreen?"100%":"360px", gridColumn:"1", gridRow:"1", visibility:vis8, position:"absolute", top:"50%", transform: "translateY(-50%)"}}></img>
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis1, margin:0, position:"absolute", top:"50%", transform: "translateY(-50%)"}}
              id="vid"
              src={this.props.src}
              autoPlay
              muted={this.props.muted || hide_main || this.state.isCasting || this.state.init_loading}
              loop={!this.props.src}
              controls={false}
              disableremoteplayback="true"
            />
            <div style={{width:"100%", visibility:vis2, position:"absolute", top:"50%", transform: "translateY(-50%)"}}>
              <div id="noclickscreen2" style={{height:"100%", width:"100%", position:"absolute", zIndex:"3"}}></div>
              <div id="timefiller" style={{width:"100%"}}></div>
            </div>
            <video
              style={{width: '100%', gridColumn:"1", gridRow:"1", visibility:vis7, position:"absolute", top:"50%", transform: "translateY(-50%)"}}
              src="/videos/test3.mp4"
              autoPlay
              muted={true}
              loop={true}
              controls={false}
            />
          </div>
          <div style={{backgroundColor:"black", position:"absolute", display:"flex",  width:"100%", zIndex:"5", top:height=="360"?"650px":"530px"}}>

            <div style={{display:"flex", flexFlow:"wrap", justifyContent:"space-between", width:"100%"}}>
              <div style={{display:"flex", backgroundColor:"black"}}>
                {this.props.muted?<button className="videobutton mute" onClick={this.toggleMute}></button>:<button className="videobutton unmute" onClick={this.toggleMute}></button>}
                <button className="videobutton fullscreen" onClick={this.fullscreen}></button>
                <CastButton socketError={this.props.socketError} segment={this.props.segment} d={this.d} progress={this.props.progress} src={this.props.src}/>
                <button className = "videobutton upchannel" style={{imageRendering:"pixelated", backgroundSize:"cover"}} onClick={this.upChannel} ></button>
                <button className = "videobutton downchannel" style={{imageRendering:"pixelated", backgroundSize:"cover"}} onClick={this.downChannel} ></button>   
                <div style={{display:"flex"}}>
                  {this.props.allChannels.length?<div className = "videobutton flickall" style={{ border:this.props.selectedFlick=="all"?`solid ${this.props.flickColor} 2px`:"", imageRendering:"pixelated", backgroundSize:"cover"}} onClick={this.props.flickChange.bind(this, "all")} ></div>:null}
                  {this.props.favoriteChannels.length?<div className = "videobutton flickfavorite" style={{ border:this.props.selectedFlick=="favorite"?`solid ${this.props.flickColor} 2px`:"", imageRendering:"pixelated", backgroundSize:"cover"}} onClick={this.props.flickChange.bind(this, "favorite")}></div>:null}
                  {this.props.hotChannels.length?<div className = "videobutton flickhot" style={{ border:this.props.selectedFlick=="hot"?`solid ${this.props.flickColor} 2px`:"", imageRendering:"pixelated", backgroundSize:"cover"}} onClick={this.props.flickChange.bind(this, "hot")} ></div>:null}
                  {this.props.newChannels.length?<div className = "videobutton flicknew" style={{ border:this.props.selectedFlick=="new"?`solid ${this.props.flickColor} 2px`:"", imageRendering:"pixelated", backgroundSize:"cover"}} onClick={this.props.flickChange.bind(this, "new")} ></div>:null}
                </div>
              </div>
              <div style={{display:"flex", backgroundColor:"black", margin:"0 14px"}}>
                <button className = "videobutton keypad" style={{imageRendering:"pixelated", backgroundSize:"cover"}} onClick={() => {this.setState({showKeypad:!this.state.showKeypad})}} ></button>   
                <div style={{visibility:this.state.showKeypad?"":"hidden", display:"flex"}}>
                  <input value={this.state.controlChannelOnChange} id="channelchange" onChange={this.channelInputOnChange} style={{fontSize:window.innerWidth<700?"20px":"30px", margin:window.innerWidth<700?"0":"14px 0", display:"inline-block", height:window.innerWidth<700?"20px":"30px", width:window.innerWidth<700?"50px":"84px"}}></input>
                  <button className="videobutton" onClick={this.switchChannel} style={{padding:"0px", fontSize:"10px", display:"inline-block", verticalAlign:"super"}}>Go</button>
                </div>
                <div style={{color:"white", fontSize:window.innerWidth<700?"20px":"30px", margin:window.innerWidth<700?"0 14px":"14px"}}>{this.props.numViewers}</div>
                {this.props.isFavorite?
                  <button onClick = {this.props.removeFavorite} className = "videobutton favorite" style={{imageRendering:"pixelated", backgroundSize:"cover"}}></button>
                  :
                  <button onClick = {this.props.addFavorite} className = "videobutton notfavorite" style={{imageRendering:"pixelated", backgroundSize:"cover"}}></button>}
              </div>
            </div>
          </div>
          <div style={{width:"100%", backgroundColor:"black"}}></div>
          {this.props.relatedChannels.length?<div style={{position:"absolute", top:"180px", left:"1000px"}}><div>Related Channels</div>{this.props.relatedChannels.map((channel) => {return this.channelElem(channel)})}</div>:null}
      </div>
    )
  }
}


export default {
  Ytplayer,
  VideoPlayer
}
