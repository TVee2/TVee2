import React, {Component} from 'react'
import ManageHeader from './ManageHeader'
export default class ManageChannels extends Component {
  constructor() {
    super()

    this.state = {}
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <h1>Manage Channels - list channels</h1>
        <div>select a channel (dropdown)</div>
        <div>load playlist to channel schedule(this will overwrite current channel schedule, 5 second in between w default vids)</div>
        <h2>show schedule (just a list of timeslots sorted by time descending)</h2>
        <h2>upload a video as default filler piece and link to channel</h2>
        <div>Create a channel</div>
        <form onSubmit={this.channelSubmit}>
          <input type="text" disabled id="channelname" name="channelname"/><br/>
          <input type="submit" disabled value="submit" />
        </form>
        <br />
        <br/><br/>
      </div>
    )
  }
}
