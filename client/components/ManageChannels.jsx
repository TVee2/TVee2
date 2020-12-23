import React, {Component} from 'react'
import axios from 'axios'

export default class ManageChannels extends Component {
  constructor() {
    super()

    this.state = {channels:[], playlists:[], selectedChannelId:null, selectedPlaylistId:null, timeslots:{before_ts:[], after_ts:[]}}
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
    axios.get(`/api/timeslots/${this.state.selectedChannelId}`)
    .then((ret) => {
      this.setState({timeslots:ret.data})
    })
  }

  onChannelChange = (e) => {
    this.setState({selectedChannelId: e.target.value}, () => {
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

  submitDefaultVid = () => {
    
  }

  render() {
    //snYu2JUqSWs for loop maybe?
    return (
      <div>
        <h1>Manage Channels - list channels</h1>

        <div>Program channel as looping playlist</div>

        <div>Select a channel</div>
        <select id="channel" defaultValue={'DEFAULT'} onChange={this.onChannelChange}>
          <option disabled value='DEFAULT'> -- select an option -- </option>
          {this.state.channels.map(ch => {
            return <option value={`${ch.id}`}>{ch.id} - {ch.name}</option>
          })}
        </select>
        <br/><br/>
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
          <input type="submit" disabled value="submit" />
        </form>

        <br /><br />
        <div>Channel Schedule</div>
        <div>Current Datetime - {new Date().toLocaleString()}</div>
        <div>Scheduled for Before Now</div>
        {this.state.timeslots.before_ts.map((ts) => {
          return <div>Title - {ts.program.title}   &&    Timeslot - {new Date(parseInt(ts.starttime)).toLocaleString()} - {new Date(parseInt(ts.endtime)).toLocaleString()}</div>
        })}
        <div>Scheduled for After Now</div>
        {this.state.timeslots.after_ts.map((ts) => {
          return <div>Title - {ts.program.title}   &&    Timeslot - {new Date(parseInt(ts.starttime)).toLocaleString()} - {new Date(parseInt(ts.endtime)).toLocaleString()}</div>
        })}
        <br /><br />

        <div>Create a channel</div>
        <form onSubmit={this.channelSubmit}>
          <input type="text" id="channelname" name="channelname"/><br/>
          <input type="submit" value="submit" />
        </form>
        <br />
        <br/><br/>
      </div>
    )
  }
}
