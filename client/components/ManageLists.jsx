import React, {Component} from 'react'
import ManageHeader from './ManageHeader'
import axios from 'axios'

export default class ManageLists extends Component {
  constructor() {
    super()

    this.state = {playlists:[]}
  }

  componentDidMount() {
    this.getPlaylists()
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

  playlistIdSubmit = (e) => {
    e.preventDefault()
    var playlistId = document.getElementById("playlistId").value
    axios.post(`/api/playlist/ytplaylist/${playlistId}`)
    .then((ret) => {
      this.getPlaylists()
    })
    .catch((e) => {
      console.log(e)
    })
  }

  render() {
    return (
      <div>
        <h1>Manage lists</h1>
        <div>Create a playlist (then set as selected)<input></input><button>submit</button></div>
        <br/><br/>
        <h3>Import a youtube playlist (this will add all videos in playlist to your collection)</h3>
        <br/><br/>
        <form onSubmit={this.playlistIdSubmit}>
          <label htmlFor="title">Youtube playlist id:</label>
          <input type="text" id="playlistId" name="playlistid"/><br/>
          <input type="submit" value="Import playlist" />
        </form>
        <br/><br/>

        <div>Playlists</div>
        {this.state.playlists.map((playlist, i) => {
          return <ul>Playlist {i+1} - {playlist.title}{playlist.playlistItems.map((v) => {
            return <div><img src={v.thumbnailUrl}></img>{v.title} - {v.duration} <button>Remove Video</button></div>
          })}</ul>
        })}
        <div>Add video to playlist by youtube id</div>
        <div>Add video to playlist from videos</div>

      </div>
    )
  }
}
