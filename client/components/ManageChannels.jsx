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
        <h1>Manage Channels</h1>
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
