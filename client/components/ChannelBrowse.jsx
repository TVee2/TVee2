import React, {Component} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'

export default class ChannelBrowse extends Component {
  constructor() {
    super()

    this.state = {channels:[]}
  }

  componentDidMount() {
    this.getChannels()
  }

  getChannels = () => {
    axios.get('/api/channels')
   .then((ret) => {
      this.setState({channels:ret.data})
    })
  }

  render() {
    return (
      <div>
        {this.state.channels.map((channel) => {
          return <div><Link to={`/tv/${channel.id}`}>{channel.id} - {channel.name}</Link></div>
        })}
      </div>
    )
  }
}
