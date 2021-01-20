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
      selectedRadio: null,
      selectedChannel:null,
      disableChannelSelect:false,

      showChannelDescriptionEdit:false,
      showHashtagEdit:false,
      showPlaceholderEdit:false,
      showPlaylistIdEdit:false,
      showYoutubeChannelIdEdit:false,
    }

    this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }

  componentDidMount() {
    this.getChannels()
    this.getPlaylists()
  }

  toggleShowChannelDescriptionEdit = () => {
    this.setState({showHashtagEdit:false, showChannelDescriptionEdit:!this.state.showChannelDescriptionEdit, showPlaceholderEdit:false, showPlaylistIdEdit:false, showYoutubeChannelIdEdit:false})
  }

  toggleShowHashtagEdit = () => {
    this.setState({showHashtagEdit:!this.state.showHashtagEdit, showChannelDescriptionEdit:false, showPlaceholderEdit:false, showPlaylistIdEdit:false, showYoutubeChannelIdEdit:false})
  }

  toggleShowPlaceholderEdit = () => {
    this.setState({showHashtagEdit:false, showChannelDescriptionEdit:false, showPlaceholderEdit:!this.state.showPlaceholderEdit, showPlaylistIdEdit:false, showYoutubeChannelIdEdit:false})   
  }

  toggleShowPlaylistIdEdit = () => {
    this.setState({showHashtagEdit:false, showChannelDescriptionEdit:false, showPlaylistIdEdit:!this.state.showPlaylistIdEdit, showPlaceholderEdit:false, showYoutubeChannelIdEdit:!this.state.showYoutubeChannelIdEdit})
  }

  handleTabClick = (tab) => {
    this.setState({activeTab: tab})
  }

  getChannels = () => {
    axios.get('/api/channels/editable')
   .then((ret) => {
      if(ret.data.length){      
        this.setState({channels:ret.data, selectedChannelId:ret.data[0].id}, () => {
          this.getChannelSchedule(this.state.selectedChannelId)
        })
      }
    })
  }

  getChannel = (id) => {
    axios.get(`/api/channels/${id}`)
   .then((ret) => {
      this.setState({selectedChannel:ret.data.channel})
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
      this.getChannel(this.state.selectedChannelId)
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

  channelDeactivate = () => {
    this.setState({disableChannelSelect:true})

    axios.put('/api/channels/deactivate/${this.state.selectedChannel.id}')
    .then((channel) => {
      this.setState({disableChannelSelect:false})
      this.getChannel(this.state.selectedChannel.id)
    })
  }

  channelActivate = () => {
    this.setState({disableChannelSelect:true})

    axios.put('/api/channels/activate/${this.state.selectedChannel.id}')
    .then((channel) => {
      this.setState({disableChannelSelect:false})
      this.getChannel(this.state.selectedChannel.id)
    })
  }

  channelSubmit = (e) => {
    e.preventDefault()
    var name = document.getElementById("channelname").value
    var description = document.getElementById("channeldescription").value
    var defaultVideoId = document.getElementById("defaultvideoid").value
    var playlistId = document.getElementById("playlistid").value
    var youtubeChannelId = document.getElementById("youtubeChannelId").value

    var htag1 = document.getElementById("htag1").value
    var htag2 = document.getElementById("htag2").value
    var htag3 = document.getElementById("htag3").value
    var htag4 = document.getElementById("htag4").value

    var hashtags = [htag1, htag2, htag3, htag4]

    if(name.length==0 || (playlistId.length==0&&youtubeChannelId.length==0)){
      this.setState({channelSubmitMessage:"name and playlistid or youtubeChannelId are required"})
    }else if(name.length > 7){
      this.setState({channelSubmitMessage:"name cannot be more than 7 characters"})
    }else if(!name.match(/^\w+$/)){
      this.setState({channelSubmitMessage:"name can only be alphanumeric characters and underscore"})
    }else if(description.length > 1000){
      this.setState({channelSubmitMessage:"description cannot be more than 1000 characters"})
    }else if(htag1.length>15 || htag2.length>15 || htag3.length>15 || htag4.length>15){
      this.setState({channelSubmitMessage:"hashtags cannot be more than 15 characters"})
    }else{
      this.setState({channelSubmitMessage:"working..."})
      axios.post('/api/channels', {name, description, defaultVideoId, youtubeChannelId, playlistId, hashtags})
      .then(() => {
        this.setState({channelSubmitMessage:""})
        document.getElementById("channelname").value=""
        document.getElementById("channeldescription").value=""
        document.getElementById("defaultvideoid").value=""
        document.getElementById("playlistid").value=""
        document.getElementById("youtubeChannelId").value=""
        document.getElementById("htag1").value = ""
        document.getElementById("htag2").value = ""
        document.getElementById("htag3").value = ""
        document.getElementById("htag4").value = ""

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

  deleteChannel = (id) => {
    var r = confirm("Are you sure you want to delete this channel?");
    if (r == true) {
      axios.delete(`/api/channels/${id}`)
      .then((res) => {
        this.getChannels()
      })
    }
  }

  resetForms = () => {

  }

  requestChannelEdit = (obj) => {
    this.setState({disableChannelSelect:true})

    axios.put(`/api/channel${this.state.selectedChannel.id}`, obj)
    .then(() => {
      this.setState({disableChannelSelect:false})
      this.getChannel(this.state.selectedChannel.id)
    }).catch(() => {
      this.setState({disableChannelSelect:false})
    })
  }

  changeDescription = () => {
    event.preventDefault()
    var description = document.getElementById("description").value
    this.requestChannelEdit({description})
  }

  changeYoutubeChannelId = () => {
    event.preventDefault()
    var youtubeChannelId = document.getElementById("changeyoutubechannelid").value
    this.requestChannelEdit({youtubeChannelId})
  }

  changePlaylistId = () => {
    event.preventDefault()
    var playlistId = document.getElementById("changeplaylistid").value
    this.requestChannelEdit({playlistId})
  }

  changeDefaultVidId = () => {
    event.preventDefault()
    var defaultVid = document.getElementById("defaultVid").value
    this.requestChannelEdit({defaultVid})
  }

  changeHashtags = () => {
    event.preventDefault()
    var htag1 = document.getElementById("htag1").value
    var htag2 = document.getElementById("htag2").value
    var htag3 = document.getElementById("htag3").value
    var htag4 = document.getElementById("htag4").value
    var tags = [htag1, htag2, htag3, htag4]
    this.requestChannelEdit({hashtags:tags})
  }

  radioChange = (e) => {
    this.setState({selectedRadio:e.target.value})
  }

  render() {
    var today = new Date()
    var tomorrow = new Date()

    tomorrow.setDate(today.getDate()+1)
    tomorrow.setHours(0,0,0,0)
    today.setHours(0,0,0,0)

    var channel = this.state.selectedChannel
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
            <label>Enter 4 hashtags:</label>
            <input type="text" id="htag1" name="htag1"/><br/>
            <input type="text" id="htag2" name="htag2"/><br/>
            <input type="text" id="htag3" name="htag3"/><br/>
            <input type="text" id="htag4" name="htag4"/><br/>
            <br/>
            <label>Channel Description (optional):</label>
            <textarea type="text" id="channeldescription" name="channeldescription"/><br/>
            <br/>
            <label>Default Video Youtube ID (optional):</label>
            <input type="text" id="defaultvideoid" name="defaultvideoid"/><br/>

            <label htmlFor="playlist">Youtube Playlist Upload</label><br/>
            <input type="radio" onChange={this.radioChange} id="playlist" name="uploadtype" value="playlist"/>
            <label htmlFor="channelcreator">Youtube Channel Upload</label><br/>
            <input type="radio" onChange={this.radioChange} id="channelcreator" name="uploadtype" value="channelcreator"/>
            
            <br/>
            {this.state.selectedRadio=="playlist"?<div>
              <label>Looping Playlist Youtube ID:</label>
              <input type="text" id="playlistid" name="playlistid"/>
            </div>:null}
            {this.state.selectedRadio=="channelcreator"?<div>
              <label>Youtube Channel Id:</label>
              <input type="text" id="playlistid" name="playlistid"/>
            </div>:null}
            <br/><br/>
            <input disabled={!this.state.selectedRadio} type="submit" value="submit" />
          </form>
          <div style={{color:"red"}}>{this.state.channelSubmitMessage}</div>
          <br />
          <br/><br/>
        </div>
        :null}
        {this.state.activeTab.key=="vedit"?
        <div>
          <div>Select a channel</div>
          <select disabled={this.state.disableChannelSelect} id="channel" defaultValue={'DEFAULT'} onChange={this.onChannelChange}>
            <option disabled value='DEFAULT'> -- select an option -- </option>
            {this.state.channels.map(ch => {
              return <option value={`${ch.id}`}>{ch.id} - {ch.name}</option>
            })}
          </select>
          <br/><br/>
        {this.state.selectedChannelId?
        <div>
          {channel?<div>
            <div>CHANNEL INFORMATION</div>
            <div>Address - {channel.id}</div>
            <div>Name - {channel.name}</div>
            <div>Description - {channel.description?channel.description:"none"}</div>

            <button onClick={this.toggleShowChannelDescriptionEdit}>Edit</button>
            {this.state.showChannelDescriptionEdit?<div>
            <div>Change channel description</div>
              <form onSubmit={this.changeDescription}>
                <textarea type="text" id="description" name="description" defaultValue={channel.description}/><br/>
                <input type="submit" value="submit" />
              </form>
            </div>:null}
            <div>Seeding currently set to {channel.playlist.youtubeId?"seed by playlist":""}{channel.playlist.youtubeChannelId?"seed by channel":""} and seeding from {channel.playlist.youtubeId?"playlist":""}{channel.playlist.youtubeChannelId?"channel":""} id {channel.playlist.youtubeId?channel.playlist.youtubeId:channel.playlist.youtubeChannelId}</div>
            <button onClick={this.toggleShowPlaylistIdEdit}>Edit</button>
            {this.state.showPlaylistIdEdit?<div>
              <div>Set/Change playlist id (this will replace current id and switch to the playlist seeding scheme)</div>
              <form onSubmit={this.changePlaylistId}>
                <input type="text" id="changeplaylistid" name="changeplaylistid" defaultValue={channel.playlist.youtubeId}/><br/>
                <input type="submit" value="submit" />
              </form>
            </div>:null}
            {this.state.showYoutubeChannelIdEdit?<div>
            <div>Set/Change youtube channel id (this will replace current id and switch to the channel creator seeding scheme)</div>
            <form onSubmit={this.changeYoutubeChannelId}>
              <input type="text" id="changeyoutubechannelid" name="changeyoutubechannelid" defaultValue={channel.playlist.youtubeChannelId}/><br/>
              <input type="submit" value="submit" />
            </form>
            </div>:null}
            <div>Tags - {channel && channel.hashtags && channel.hashtags.length?channel.hashtags.map((h) => {return <div>{h.tag}</div>}):"none"}</div>
            <button onClick={this.toggleShowHashtagEdit}>Edit</button>
            {this.state.showHashtagEdit?<div><div>Edit tags</div>
            <form onSubmit={this.changeHashtags}>
              <input type="text" id="htag1" name="htag1" defaultValue={channel.hashtags[0]?channel.hashtags[0].tag:""}/><br/>
              <input type="text" id="htag2" name="htag2" defaultValue={channel.hashtags[1]?channel.hashtags[1].tag:""}/><br/>
              <input type="text" id="htag3" name="htag3" defaultValue={channel.hashtags[2]?channel.hashtags[2].tag:""}/><br/>
              <input type="text" id="htag4" name="htag4" defaultValue={channel.hashtags[3]?channel.hashtags[3].tag:""}/><br/>
              <input type="submit" value="submit" />
            </form></div>:null}
            <br/>
            <div>Placeholder Video ID - {channel.defaultProgram?channel.defaultProgram.youtubeId:"none"}</div>
            <button onClick={this.toggleShowPlaceholderEdit}>Edit</button>
            {this.state.showPlaceholderEdit?<div>
              <div>Change placeholder video.  If none will default to tvdrop video</div>
              <form onSubmit={this.changeDefaultVidId}>
                <input type="text" id="defaultVid" name="defaultVid" defaultValue={channel.defaultProgram?channel.defaultProgram.youtubeId:""}/><br/>
                <input type="submit" value="submit" />
              </form>
            </div>:null}
          </div>:null}
          <br/>
          <div>Note: Youtube specific information will need to be changed on youtube.  Information is updated nightly.</div>
          <br/><br/>
          {this.state.selectedChannel && this.state.selectedChannel.active?
          <div>DEACTIVATE CHANNEL <button onClick={this.channelDeactivate}>SUBMIT</button></div>:
          <div>ACTIVATE CHANNEL <button onClick={this.channelActivate}>SUBMIT</button></div>
          }
          <div>DELETE THIS CHANNEL <button onClick={this.deleteChannel}>DELETE</button></div>
          <div>DELETE FUTURE TIMESLOTS AND RESEED WITH CURRENT PLAYLIST
            <button>SUBMIT</button>
            (if playlist id changed this will delete all future timeslots and seed new timeslots from updated playlist, otherwise schedule will update nightly)
          </div>
          <br/><br/>
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
                      <div>Youtube video: {timeslot.program.youtubeId}</div>
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
                      <div>Youtube video: {timeslot.program.youtubeId}</div>
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
