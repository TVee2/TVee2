import React, {Component} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'

export default class ChannelBrowse extends Component {
  render() {
    return (
      <div>
        {this.props.channels.map((channel) => {
          return <div><Link to={`/tv/${channel.id}`}>{channel.id} - {channel.name}</Link></div>
        })}
      </div>
    )
  }
}
