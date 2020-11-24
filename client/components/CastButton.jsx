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
    console.log("INITIALIZE CAST PLAYER")
    var options = {};

    options.receiverApplicationId = 'CC1AD845';
    options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
    options.androidReceiverCompatible = true;
    cast.framework.CastContext.getInstance().setOptions(options);

    this.remotePlayer = new cast.framework.RemotePlayer();
    this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
    this.remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
      function (e) {
        this.setState({isConnected:e.value}, () => {
          console.log("set is connected to", this.state.isConnected)
        })
        //setstate !iscasting
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
            this.setState({playerState:e.value})
          }
          console.log("!!!! PLAYER STATE CHANGED", e.value)
          // console.log("!!!$$$$$  set media loaded to true and removed debounce")
          // this.setState({isMediaLoaded:e.value, castdebounce:false}, () => {console.log("set media loaded to true and removed debounce")})
        }else{
          this.setState({isMediaLoaded:e.value}, () => {
            console.log("set media loaded to ", this.state.isMediaLoaded)
          })
        }
        this.props.switchPlayer(e.value);
      }.bind(this)
    );
    this.setState({playerState:this.remotePlayer.playerState})
    this.castSrc()
  }

  castSrc = () => {
    if(!this.props.src || this.props.src==="no source"){
      return
    }
    let mediaInfo = new chrome.cast.media.MediaInfo(1, 'video/mp4')
    console.log("CASTING...")
    mediaInfo.contentUrl = window.location.origin+this.props.src

    // mediaInfo.contentUrl = window.location.origin+this.props.src

    mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
    mediaInfo.metadata = new chrome.cast.media.TvShowMediaMetadata();
    mediaInfo.metadata.title = "test title";
    mediaInfo.metadata.subtitle = "test subtitle";
    mediaInfo.metadata.images = [{
      'url': "./no_signal.png"
    }];

    let request
    // if(!this.props.src || this.props.src=="no source"){
    //   request = new chrome.cast.media.StopRequest()
    // }else{
      request = new chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;
      request.currentTime = this.currentMediaTime;
    // }

    var session = cast.framework.CastContext.getInstance().getCurrentSession()
    if(session){
      session.loadMedia(request).then(() => {
        console.log("media loaded?")
      }).catch((e) => {console.log(e)})
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.castdebounce){
      return
    }

    if(this.state.playerState=="BUFFERING"){
      return
    }

    var remote_time = this.remotePlayer?this.remotePlayer.currentTime:null
    if(remote_time && (Math.abs(this.props.progress-remote_time)>5)){
      this.remotePlayer.currentTime = this.props.progress + 3
      this.remotePlayerController.seek()
    }

    if(this.state.playerState=="IDLE" && this.state.isConnected && this.remotePlayer.mediaInfo && this.remotePlayer.mediaInfo.contentUrl!==window.location.origin+this.props.src) {
      //media is loaded but local is different or null
      console.log("potential castSrc 1 ", this.remotePlayer.mediaInfo?this.remotePlayer.mediaInfo.contentUrl:null, window.location.origin+this.props.src)
      this.setState({castdebounce:true}, () => {
        this.castSrc()
      })
    }

    if(this.state.playerState=="IDLE" && this.state.isConnected && !this.remotePlayer.mediaInfo && this.props.src && this.props.src!=="no source") {
      //no media loaded, but there is local src
      console.log("potential castSrc 2", this.remotePlayer.mediaInfo?this.remotePlayer.mediaInfo.contentUrl:null, window.location.origin+this.props.src)
      this.setState({castdebounce:true}, () => {
        this.castSrc()
      })
    }

  }

  render() {
    return (
      <div>
        <button onClick={this.castSrc}>load media</button>
        <google-cast-launcher id="castbutton">Cast</google-cast-launcher>
      </div>
    )
  }
}
