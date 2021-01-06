import React, {Component} from 'react'
import axios from 'axios'

var channelTabData = [
  { name: 'Create Channel', key:"create", isActive: true },
  { name: 'View/Edit Channel', key:"vedit", isActive: false },
];

class Tabs extends React.Component {
  render() {
    return (
      <ul className="nav nav-tabs">
        {channelTabData.map((tab) => {
          return (
            <Tab key={tab.name} data={tab} isActive={this.props.activeTab === tab} handleClick={this.props.changeTab.bind(this, tab)} />
          )
        })}
      </ul>
    );
  }
}

class Tab extends React.Component {
  render() {
    return (
      <li onClick={this.props.handleClick} className={this.props.isActive ? "active" : null}>
        <a>{this.props.data.name}</a>
      </li>
    );
  }
}

export default class ManageChannels extends Component {
  constructor() {
    super()

    this.state = {
      channels:[],
      channelSubmitMessage:"",
      playlists:[],
      selectedChannelId:null,
      selectedPlaylistId:null,
      timeslots:{today:[], tomorrow:[], defaultSrc:""},
      activeTab: channelTabData[0],
    }

    this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }

  componentDidMount() {
    this.getChannels()
    this.getPlaylists()
  }

  handleTabClick = (tab) => {
    this.setState({activeTab: tab})
  }

  getChannels = () => {
    axios.get('/api/channels')
   .then((ret) => {
      this.setState({channels:ret.data})
    })
  }

  getChannelSchedule = () => {
    if(!this.state.selectedChannelId){
      return
    }
    axios.get(`/api/timeslots/${this.state.selectedChannelId}?offset=${new Date().getTimezoneOffset()}`)
    .then((ret) => {
      this.setState({timeslots:ret.data})
    })
  }

  onChannelChange = (e) => {
    this.setState({selectedChannelId: e.target.value, timeslots:{today:[], tomorrow:[]}}, () => {
      this.getChannelSchedule(this.state.selectedChannelId)
    })
  }

  getPlaylists = () => {
    axios.get(`/api/playlist`)
    .then((ret) => {
      this.setState({playlists:ret.data})
    })
    .catch((e) => {
      console.log(e)
    })
  }

  onPlaylistChange = (e) => {
    this.setState({selectedPlaylistId: e.target.value})
  }

  setChannelPlaylist = () => {
    var channelId = document.getElementById("channel").value
    var playlistId = document.getElementById("playlist").value
    if(channel && playlist){
      axios.post('/api/channels/playlist', {channelId, playlistId})
      .then(() => {
        this.getChannelSchedule()
        console.log("succeeded")
      })
    }
  }

  channelSubmit = (e) => {
    var name = document.getElementById("channelname").value
    var description = document.getElementById("channeldescription").value
    var defaultVideoId = document.getElementById("defaultvideoid").value
    var playlistId = document.getElementById("playlistid").value

    if(name.length > 7){
      this.setState({channelSubmitMessage:"name cannot be more than 7 characters"})
    }else if(!name.match(/^\w+$/)){
      this.setState({channelSubmitMessage:"name can only be alphanumeric characters and underscore"})
    }else if(description.length > 1000){
      this.setState({channelSubmitMessage:"description cannot be more than 1000 characters"})
    }else{
      this.setState({channelSubmitMessage:"working..."})
      axios.post('/api/channels', {name, description, defaultVideoId, playlistId})
      .then(() => {
        this.setState({channelSubmitMessage:""})
        document.getElementById("channelname").value=""
        document.getElementById("channeldescription").value=""
        document.getElementById("defaultvideoid").value=""
        document.getElementById("playlistid").value=""
        this.getChannels()
      })
      .catch((err) => {
        this.setState({channelSubmitMessage: err.message})
      })
    }
  }

  submitDefaultVid = (e) => {
    e.preventDefault()
    this.setState({loadingMessage:"Setting placeholder video..."})
    axios.post(`/api/channels/setdefsrc/${this.state.selectedChannelId}`, {defaultSrc:document.getElementById("defaultVid").value})
    .then(() => {
      document.getElementById("defaultVid").value = ""
      this.setState({loadingMessage:""})
    })
  }

  render() {
    var today = new Date()
    var tomorrow = new Date()

    tomorrow.setDate(today.getDate()+1)
    tomorrow.setHours(0,0,0,0)
    today.setHours(0,0,0,0)

    return (
      <div>
        <h1 style={{textAlign:"left"}}>Manage Channels</h1>
        <Tabs activeTab={this.state.activeTab} changeTab={this.handleTabClick} />
        {this.state.activeTab.key=="create"?
        <div>
          <ul>
            <li>Channel names must be 7 characters or less and contain only alphanumeric characters.</li><br/>
            <li>Channel description must be less than 1000 characters.</li><br/>
            <li>Youtube Video Id is visible in the youtube url when watching a video, the id follows the "v=", for example in
            "https://www.youtube.com/watch?v=Pfm8M3q-XXX" the video id is Pfm8M3q-XXX</li><br/>
            <li>Playlist youtube id is visibile in the url of the playlist page on youtube or when playing a playlist.  The id follows "list=", for example
            in "https://www.youtube.com/playlist?list=PLnEsh8867eks9qXCyR_vYfVjL3EppXXXX" the id is PLnEsh8867eks9qXCyR_vYfVjL3EppXXXX
            </li><br/>
          </ul>
          <form onSubmit={this.channelSubmit}>
            <br/>
            <label>Channel Name:</label>
            <input type="text" id="channelname" name="channelname"/><br/>
            <br/>
            <label>Channel Description (optional):</label>
            <textarea type="text" id="channeldescription" name="channeldescription"/><br/>
            <br/>
            <label>Default Video Youtube ID (optional):</label>
            <input type="text" id="defaultvideoid" name="defaultvideoid"/><br/>
            <br/>
            <label>Looping Playlist Youtube ID:</label>
            <input type="text" id="playlistid" name="playlistid"/><br/><br/>
            <input type="submit" value="submit" />
          </form>
          <div style={{color:"red"}}>{this.state.channelSubmitMessage}</div>
          <br />
          <br/><br/>
        </div>
        :null}
        {this.state.activeTab.key=="vedit"?
        <div>
          <div>Select a channel</div>
          <select id="channel" defaultValue={'DEFAULT'} onChange={this.onChannelChange}>
            <option disabled value='DEFAULT'> -- select an option -- </option>
            {this.state.channels.map(ch => {
              return <option value={`${ch.id}`}>{ch.id} - {ch.name}</option>
            })}
          </select>
          <br/><br/>
        {this.state.selectedChannelId?
        <div>
          <div>Program channel as looping playlist</div>
          <div>Select a playlist</div>
          <select id="playlist" defaultValue={'DEFAULT'} value={this.state.selectedPlaylistId} onChange={this.onPlaylistChange}>
            <option disabled value='DEFAULT'> -- select an option -- </option>
            {this.state.playlists.map(playlist => {
              return <option value={`${playlist.id}`}>{playlist.title}</option>
            })}
          </select>
          <br/><br/>
          <button onClick={this.setChannelPlaylist}>Submit</button>
          <br/><br/>
          <br/><br/>
          <div>Optionally, set a placeholder video.  If none will default to tvdrop video</div>
          <form onSubmit={this.submitDefaultVid}>
            <input type="text" id="defaultVid" name="defaultVid"/><br/>
            <input type="submit" value="submit" />
          </form>
          <div>{this.state.loadingMessage}</div>

          <br /><br />


          <div style={{height:"1440px", width:"600px"}}>
            <div style={{width:"60px", display:"inline-block"}}>
              <div style={{position:"absolute"}}>
                {Array.from(new Array(48)).map((x, i) => {
                  return <div style={{position:"absolute", top:`${i*30}px`}}>{`${Math.floor(i/2)}:${(i%2)*30}`}</div>
                })}
              </div>
            </div>
            <div style={{width:"200px", height:"100%", display:"inline-block"}}>{`${this.days[new Date().getDay()]}`}
              <div style={{position:"absolute"}}>
              {this.state.timeslots.today.map((timeslot) => {
                return (<div
                  style={{position:"absolute", height:`${(timeslot.endtime-timeslot.starttime)/60000}px`, top:`${(timeslot.starttime - today.getTime())/60000}px`, width:"200px", backgroundColor:timeslot.program.color}}
                  id={`za${timeslot.id}`}
                  onMouseLeave={() => {document.getElementById(`za${timeslot.id}`).classList.toggle('overflowhidden'); document.getElementById(`zz${timeslot.id}`).classList.toggle('zout')}}
                  onMouseEnter={() => {document.getElementById(`za${timeslot.id}`).classList.toggle('overflowhidden'); document.getElementById(`zz${timeslot.id}`).classList.toggle('zout')}}
                  className="timeslotitem overflowhidden"
                  >
                    <div id={`zz${timeslot.id}`} style={{width:"200px", position:"absolute",  backgroundColor:`${timeslot.program.color}`}} className=''>
                      {timeslot.program.title}
                      <div>Youtube video: {timeslot.program.ytVideoId}</div>
                      <div>{`Starttime: ${new Date(parseInt(timeslot.starttime)).toLocaleTimeString()}`}</div>
                      <div>{`Endtime: ${new Date(parseInt(timeslot.endtime)).toLocaleTimeString()}`}</div>
                      <img style={{height:"100px", width:"100px"}} src={timeslot.program.thumbnailUrl}></img>
                    </div>
                  </div>)
              })}
              </div>
            </div>
            <div style={{width:"200px", height:"100%", display:"inline-block"}}>{`${this.days[new Date().getDay()+1]}`}
              <div style={{position:"absolute"}}>
              {this.state.timeslots.tomorrow.map((timeslot) => {
                return (<div
                    style={{position:"absolute", height:`${(timeslot.endtime-timeslot.starttime)/60000}px`, top:`${(timeslot.starttime - tomorrow.getTime())/60000}px`, width:"200px", backgroundColor:timeslot.program.color}}
                    id={`za${timeslot.id}`}
                    onMouseLeave={() => {document.getElementById(`za${timeslot.id}`).classList.toggle('overflowhidden'); document.getElementById(`zz${timeslot.id}`).classList.toggle('zout')}}
                    onMouseEnter={() => {document.getElementById(`za${timeslot.id}`).classList.toggle('overflowhidden'); document.getElementById(`zz${timeslot.id}`).classList.toggle('zout')}}
                    className="timeslotitem overflowhidden"
                    >
                    <div id={`zz${timeslot.id}`} style={{width:"200px", position:"absolute",  backgroundColor:`${timeslot.program.color}`}} className=''>
                      {timeslot.program.title}
                      <div>Youtube video: {timeslot.program.ytVideoId}</div>
                      <div>{`Starttime: ${new Date(parseInt(timeslot.starttime)).toLocaleTimeString()}`}</div>
                      <div>{`Endtime: ${new Date(parseInt(timeslot.endtime)).toLocaleTimeString()}`}</div>
                      <img style={{height:"100px", width:"100px"}} src={timeslot.program.thumbnailUrl}></img>
                    </div>
                  </div>)
              })}
              </div>
            </div>
          </div>

          <br /><br />
        </div>:null}
        </div>
        :null}
      </div>
    )
  }
}
