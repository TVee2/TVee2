import React, {Component} from 'react'
import ManageHeader from './ManageHeader'
import axios from 'axios'

var playlistTabData = [
  { name: 'View Playlists', key:"view", isActive: false },
  { name: 'Import Playlist', key:"create", isActive: true },
];

class Tabs extends React.Component {
  render() {
    return (
      <ul className="nav nav-tabs">
        {playlistTabData.map((tab) => {
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

export default class ManageLists extends Component {
  constructor() {
    super()
    this.state = { activeTab: playlistTabData[0], playlists:[], selectedPlaylistId:null, loading:false}
  }

  componentDidMount() {
    this.getPlaylists()
  }

  handleTabClick = (tab) => {
    this.setState({activeTab: tab})
  }

  getPlaylists = (setplId) => {
    axios.get(`/api/playlists`)
    .then((ret) => {
      var playlists = ret.data
      var defaultId = playlists.length?playlists[0].id:null
      this.setState({playlists:ret.data, selectedPlaylistId:defaultId})
    })
    .catch((e) => {
      console.log(e)
    })
  }

  playlistIdSubmit = (e) => {
    e.preventDefault()
    var playlistId = document.getElementById("playlistId").value
    this.setState({loading:true})
    axios.post(`/api/playlists/ytplaylist/${playlistId}`)
    .then((ret) => {
      this.getPlaylists(playlistId)
      this.setState({loading:false, activeTab:playlistTabData[0]})
    })
    .catch((e) => {
      console.log(e)
    })
  }

  onPlaylistChange = (e) => {
    this.setState({selectedPlaylistId: e.target.value})
  }

  render() {
    return (
      <div>
        <h1 style={{textAlign:"left"}}>Manage Playlists</h1>
        <Tabs activeTab={this.state.activeTab} changeTab={this.handleTabClick} />
        {this.state.activeTab.key=="create"?
          <div>
            <h3>Make sure playlist is public and all items in playlist are videos, set to public, and accessible in the desired region.</h3>
            <br/><br/>
            {this.state.loading?<div>Loading playlist please wait</div>:null}
            <form disabled={this.state.loading} onSubmit={this.playlistIdSubmit}>
              <label htmlFor="title">Youtube playlist id:</label>
              <input type="text" id="playlistId" name="playlistid"/><br/>
              <input type="submit" value="Import playlist" />
            </form>
          </div>
        :null}
        {this.state.activeTab.key=="view"?
          <div>
            {this.state.playlists.length?
              <div>
                <div>Select a playlist</div>
                <select id="playlist" defaultValue={'DEFAULT'} value={this.state.selectedPlaylistId} onChange={this.onPlaylistChange}>
                  <option disabled value='DEFAULT'> -- select an option -- </option>
                  {this.state.playlists.map(playlist => {
                    return <option value={`${playlist.id}`}>{playlist.id} - {playlist.title}</option>
                  })}
                </select>
                <br/><br/>
                <div>Selected Playlist</div>
                {this.state.playlists.map((playlist, i) => {
                  if(playlist.id != this.state.selectedPlaylistId){
                    return
                  }else{
                    return <ul>Playlist {i+1} - {playlist.title}{playlist.playlistItems.map((v) => {
                      return <div><img src={v.thumbnailUrl}></img>{v.title} - {new Date(v.duration * 1000).toISOString().substr(11, 8)}</div>
                    })}</ul>
                  }
                })}
              </div>
            :<div style={{margin:"20px"}}>Import a playlist to view playlists</div>}
          </div>
        :null}

      </div>
    )
  }
}
