import React, {Component} from 'react'
import axios from 'axios'
import PixBlock from './pix/components/PixBlock'
import {Provider} from 'react-redux'
import store from './pix/store'

export default class SingleUser extends Component {
  constructor() {
    super()

    this.state = {user: null}
  }

  componentDidMount() {
    axios.get(`/api/users/${this.props.match.params.id}`)
    .then((res) => {
      this.setState({user:res.data})
    })
  }

  render() {
    return (
      <div>
        <Provider store={store}>
          {this.state.user?<div style={{margin:"25px"}}>
            <div>
              <div>Username: {this.state.user.username}</div>
              <div>Email: {this.state.user.email}</div>
              <div>Member Since: {this.state.user.createdAt}</div>
              <div><PixBlock adgrab="mprof" pix={this.state.user.profilePix} dim={128}/></div>
            </div>
            <br/><br/>
            <div>
              Channels: 
              {this.state.user.channels.map((channel) => {
                return <div><div>{channel.name}</div><img src={channel.thumbnailUrl}></img><div>{channel.description}</div></div>
              })}
            </div>
          </div>:null}
        </Provider>
      </div>
    )
  }
}
