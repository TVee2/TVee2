import React, {Component} from 'react'
import axios from 'axios'
import history from '../history'
import {Link} from 'react-router-dom'

export default class Recommend extends Component {
  constructor(props) {
    super(props)

    this.state = {favoriteChannels:[], activeChannels:[], newChannels:[], recommendedChannels:[]}
  }

  componentDidMount() {
    this.getFavoriteChannels()
    this.getActiveChannels()
    this.getNewChannels()
    this.getRecommendedChannels()
  }

  getFavoriteChannels = () => {
    axios.get('/api/channels/favorites')
    .then((ret) => {
      this.setState({favoriteChannels:ret.data})
    })
  }

  getActiveChannels = () => {
    axios.get('/api/channels/active')
    .then((ret) => {
      this.setState({activeChannels:ret.data})
    })
  }

  getNewChannels = () => {
    axios.get('/api/channels/new')
    .then((ret) => {
      this.setState({newChannels:ret.data})
    })
  }

  getRecommendedChannels = () => {
    axios.get('/api/channels/related/favorites')
    .then((ret) => {
      this.setState({recommendedChannels:ret.data})
    })
  }

  goToChannel(id){
    history.push(`/tv/${id}`)
  }

  channelElem = (channel) => {return (
    <div className="homelistcontainer" onClick={this.goToChannel.bind(this, channel.id)}>
      <Link className="homelistanchor" to={`/tv/${channel.id}`}>{channel.id} - {channel.name}</Link>
      <img className="homelistimage" src={channel.thumbnailUrl}></img>
    </div>
  )}

  render() {
    return (
      <div>
        {this.state.favoriteChannels.length?<div>
          <h4>Favorite Channels</h4>
          <div style={{display:"flex"}}>{this.state.favoriteChannels.map((channel) => {
            return this.channelElem(channel)
          })}</div>
        </div>:null}
        {this.state.activeChannels.length?<div>
          <h4>Most Active Channels</h4>
          <div style={{display:"flex"}}>{this.state.activeChannels.map((channel) => {
            return this.channelElem(channel)
          })}</div>
        </div>:null}
        {this.state.newChannels.length?<div>          
          <h4>New Channels</h4>
          <div style={{display:"flex"}}>{this.state.newChannels.map((channel) => {
            return this.channelElem(channel)
          })}</div>
        </div>:null}
        {this.state.recommendedChannels.length?<div>
          <h4>You Might Like:</h4>
          <div style={{display:"flex"}}>{this.state.recommendedChannels.map((channel) => {
            return this.channelElem(channel)
          })}</div>
       </div>:null}
       <br/><br/><br/>
       <p>For trouble, commendables or inquires contact admin@tvee2.com</p>
       <p>Copyright 2020-2021 TVee2</p>
      </div>
    )
  }
}

