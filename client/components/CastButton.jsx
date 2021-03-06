import React, {Component} from 'react'

export default class CastButton extends Component {
  constructor() {
    super()

    this.state = {isConnected:false, castdebounce:false, isMediaLoaded:false, playerState:null}
    this.remotePlayer = null;
    this.remotePlayerController = null;
  }

  componentDidMount() {
    window['__onGCastApiAvailable'] = (isAvailable) => {
      if (isAvailable) {
       this.initializeCastPlayer();
      }
    };
  }

  initializeCastPlayer = () => {
    var options = {};

    options.receiverApplicationId = '3C992430';
    options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
    options.androidReceiverCompatible = true;
    cast.framework.CastContext.getInstance().setOptions(options);

    this.remotePlayer = new cast.framework.RemotePlayer();
    this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
    this.remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
      function (e) {
        this.setState({isConnected:e.value}, () => {
        })
        this.props.switchPlayer(e.value);
      }.bind(this)
    );
    this.remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
      function (e) {
        if(e.value){
          if(e.value==="PLAYING"){
            this.setState({playerState:e.value, castdebounce:false})
          }else if(e.value==="BUFFERING"){
            this.setState({playerState:e.value, castdebounce:true})
          }else{
            this.setState({playerState:e.value, castdebounce:false})
          }
        }else{
          this.setState({isMediaLoaded:e.value}, () => {
          })
        }
      }.bind(this)
    );
    this.setState({playerState:this.remotePlayer.playerState})
    // this.castSrc()
  }

  castSrc = () => {
    if(!this.props.src || this.props.src==="no source"){
      return
    }
    let mediaInfo = new chrome.cast.media.MediaInfo(1, 'video/mp4')
    var url
    if(!this.props.src.startsWith("https")){
      url = window.location.origin+this.props.src
    }else{
      url = this.props.src
    }
    mediaInfo.contentUrl = url

    console.log("casting", url)

    mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
    mediaInfo.metadata = new chrome.cast.media.TvShowMediaMetadata();
    mediaInfo.metadata.title = this.props.segment.program.title;

    let request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = true;
    request.currentTime = this.currentMediaTime;
    var session = cast.framework.CastContext.getInstance().getCurrentSession()
    if(session){
      session.loadMedia(request).then(() => {
      }).catch((e) => {console.log(e)})
    }
  }

  stopSrc = () => {
    var session = cast.framework.CastContext.getInstance().getCurrentSession()
    if(session){
      this.remotePlayerController.stop()
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.castdebounce){
      return
    }

    if(this.state.playerState=="BUFFERING"){
      return
    }

    if(this.props.socketError){
      this.stopSrc()
    }

    var remote_time = this.remotePlayer?this.remotePlayer.currentTime:null
    if(remote_time && (Math.abs(this.props.progress-remote_time)>5)){
      this.remotePlayer.currentTime = this.props.progress + 3
      this.remotePlayerController.seek()
    }

    if(!this.props.socketError && this.state.playerState=="IDLE" && this.state.isConnected && this.remotePlayer.mediaInfo && this.remotePlayer.mediaInfo.contentUrl!==window.location.origin+this.props.src) {
      //media is loaded but local is different or null
      this.setState({castdebounce:true}, () => {
        this.castSrc()
      })
    }

    if(!this.props.socketError && this.state.playerState=="IDLE" && this.state.isConnected && !this.remotePlayer.mediaInfo && this.props.src && this.props.src!=="no source") {
      //no media loaded, but there is local src
      this.setState({castdebounce:true}, () => {
        this.castSrc()
      })
    }

  }

  render() {
    return (
      <div style={{height:"32px", width:"40px", display:"inline"}}>
        <google-cast-launcher id="castbutton"></google-cast-launcher>
      </div>
    )
  }
}
