import React, {Component} from 'react'
import ManageHeader from './ManageHeader'
import axios from 'axios'

export default class ManageLists extends Component {
  constructor() {
    super()

    this.state = {playlists:[], selectedPlaylistId:null,}
  }

  componentDidMount() {
    this.getPlaylists()
  }

  getPlaylists = () => {
    axios.get(`/api/playlist`)
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
    axios.post(`/api/playlist/ytplaylist/${playlistId}`)
    .then((ret) => {
      this.setState({selectedPlaylistId: playlistId})
      this.getPlaylists()
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
        <h1>Manage lists</h1>
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
        <br/><br/><br/>
        <h3>Import a youtube playlist (this will add all videos in playlist to your collection, make sure all items in playlist are videos and are set to public.  non embeddable videos can not be played)</h3>
        <br/><br/>
        <form onSubmit={this.playlistIdSubmit}>
          <label htmlFor="title">Youtube playlist id:</label>
          <input type="text" id="playlistId" name="playlistid"/><br/>
          <input type="submit" value="Import playlist" />
        </form>
        <br/><br/>

        <div>Add video to playlist by youtube id</div>
        <div>Add video to playlist from videos</div>

        <div>Create a playlist (then set as selected)<input></input><button>submit</button></div>
        <br/><br/>

      </div>
    )
  }
}
