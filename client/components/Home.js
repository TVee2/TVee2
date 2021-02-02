import React, {Component} from 'react'
import axios from 'axios'
import history from '../history'
import {Link} from 'react-router-dom'

export default class Home extends Component {
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
    <div style={{height:"150px", width:"150px", margin:"10px", cursor:"pointer", border:"solid black 2px", padding:"5px"}} onClick={this.goToChannel.bind(this, channel.id)}>
      <Link to={`/tv/${channel.id}`}>{channel.id} - {channel.name}</Link>
      <img style={{margin:"10px", maxWidth:"120px", maxHeight:"120px"}} src={channel.thumbnailUrl}></img>
    </div>
  )}

  render() {
    return (
      <div>
        {this.state.favoriteChannels.length?<div>
          <div>Favorite Channels</div>
          <div style={{display:"flex", flexWrap:"wrap"}}>{this.state.favoriteChannels.map((channel) => {
            return this.channelElem(channel)
          })}</div>
        </div>:null}

        {this.state.activeChannels.length?<div>
          <div>Most Active Channels</div>
          <div style={{display:"flex", flexWrap:"wrap"}}>{this.state.activeChannels.map((channel) => {
            return this.channelElem(channel)
          })}</div>
        </div>:null}

        {this.state.newChannels.length?<div>          
          <div>New Channels</div>
          <div style={{display:"flex", flexWrap:"wrap"}}>{this.state.newChannels.map((channel) => {
            return this.channelElem(channel)
          })}</div>
        </div>:null}

        {this.state.recommendedChannels.length?<div>
          <div>You Might Like:</div>
          <div style={{display:"flex", flexWrap:"wrap"}}>{this.state.recommendedChannels.map((channel) => {
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

