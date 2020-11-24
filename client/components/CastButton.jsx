import React, {Component} from 'react'

export default class CastButton extends Component {
  constructor() {
    super()

    this.state = {}
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

    options.receiverApplicationId = '7EE53CCB';
    options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
    options.androidReceiverCompatible = true;
    cast.framework.CastContext.getInstance().setOptions(options);

    this.remotePlayer = new cast.framework.RemotePlayer();
    this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
    this.remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
      function (e) {
        this.props.switchPlayer(e.value);
      }.bind(this)
    );
    this.castSrc()
  }

  castSrc = () => {
    let mediaInfo = new chrome.cast.media.MediaInfo(1, 'video/mp4')
    mediaInfo.contentUrl = window.location.origin+this.props.src
    mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
    mediaInfo.metadata = new chrome.cast.media.TvShowMediaMetadata();
    mediaInfo.metadata.title = "test title";
    mediaInfo.metadata.subtitle = "test subtitle";
    mediaInfo.metadata.images = [{
      'url': "./no_signal.png"
    }];

    let request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = true;

    request.currentTime = this.currentMediaTime;
    cast.framework.CastContext.getInstance().getCurrentSession().loadMedia(request).then(() => {
      console.log("media loaded?")
    }).catch((e) => {console.log(e)})
  }

  componentDidUpdate(prevProps, prevState){
    var remote_time = this.remotePlayer?this.remotePlayer.currentTime:null
    if(remote_time && (Math.abs(this.props.progress-remote_time)>5)){
      this.remotePlayer.currentTime = this.props.progress + 3
      this.remotePlayerController.seek()
    }
    console.log(this.props.src, this.props.src!=="no source", (this.props.src!==prevProps.src), this.remotePlayer)
    if(this.remotePlayer){
      console.log(this.remotePlayer.isConnected, this.remotePlayer.mediaInfo)
      if(this.remotePlayer.mediaInfo){
        console.log(this.remotePlayer.mediaInfo.contentUrl !== window.location.origin+this.props.src)
      }
    }
    if(this.props.src && this.props.src!=="no source" && (this.props.src!==prevProps.src)) {
      this.castSrc()
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
