import React, {Component} from 'react'
import ManageHeader from './ManageHeader'

export default class ManageVideos extends Component {
  // constructor() {
  //   super()

  //   this.state = {}
  // }

  // componentDidMount() {}

  youtubeIdSubmit = (e) => {
    e.preventDefault()
    var yid = document.getElementById("yid").value
    axios.post('/api/videos/youtubelink', {yid})
    .then((res) => {
      this.props.getMyVids()
    })
    .catch((err) => {})
  }

  render() {
    return (
      <div>
        <h1>Manage Videos</h1>
        <div>Add a youtube video to collection</div>
        <form onSubmit={this.youtubeIdSubmit}>
          <label htmlFor="yid">Youtube ID:</label>
          <input type="text" id="yid" name="yid"/><br/>
          <input type="submit" value="Add Video" />
        </form>
        <br />
        <br />
        <br /><br />
        My Videos:
        <div>Name Duration</div>
        {this.props.videos.map((v) => {
          return <div><img src={v.thumbnailUrl}></img>{v.title} - {v.duration} <button>Remove Video</button></div>
        })}
        <br /><br />
      </div>
    )
  }
}
