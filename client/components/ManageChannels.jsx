import React, {Component} from 'react'
import axios from 'axios'

export default class ManageChannels extends Component {
  constructor() {
    super()

    this.state = {channels:[], playlists:[], selectedChannelId:null, selectedPlaylistId:null, timeslots:{today:[], tomorrow:[], defaultSrc:""}}
    this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }

  componentDidMount() {
    this.getChannels()
    this.getPlaylists()
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
    axios.post('/api/channels', {name})
    .then(() => {
      this.getChannels()
    })
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
        <h1>Manage Channels - list channels</h1>
        <div>Create a channel</div>
        <form onSubmit={this.channelSubmit}>
          <input type="text" id="channelname" name="channelname"/><br/>
          <input type="submit" value="submit" />
        </form>
        <br />
        <br/><br/>

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
    )
  }
}
