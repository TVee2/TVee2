import React, {Component} from 'react'
import axios from 'axios'
import PixBlock from './pix/components/PixBlock'

export default class AdminDelete extends Component {
  constructor() {
    super()
    this.state = {
      channels:[],
      users:[],
      pix:[],
      comments:[],
      playlists:[],
      programs:[],
      timeslots:[],
    }
  }

  getChannels = () => {
    axios.get('/api/channels/all')
    .then((res) => {
      this.setState({channels:res.data})
    })
  }

  getUsers = () => {
    axios.get('/api/users/all')
    .then((res) => {
      this.setState({users:res.data})
    })
  }

  getPix = () => {
    axios.get('/api/pix/all')
    .then((res) => {
      this.setState({pix:res.data})
    })
  }

  getComments = () => {
    axios.get('/api/comments/all')
    .then((res) => {
      this.setState({comments:res.data})
    })
  }

  getPlaylists = () => {
    axios.get('/api/playlists/all')
    .then((res) => {
      this.setState({playlists:res.data})
    })
  }

  getPrograms = () => {
    axios.get('/api/programs/all')
    .then((res) => {
      this.setState({programs:res.data})
    })
  }

  getTimeslots = () => {
    axios.get('/api/timeslots/all')
    .then((res) => {
      this.setState({timeslots:res.data})
    })
  }



  deleteTimeslot = (id) => {
    axios.delete(`/api/timeslots/${id}`)
    .then((res) => {
      this.getTimeslots()
    })
  }

  deleteChannel = () => {
    axios.delete(`/api/channels/:${id}`)
    .then((res) => {
      this.getChannels()
    })
  }

  deactivateChannel = () => {
    axios.post(`/api/channels/deactivate/${id}`)
    .then((res) => {
      this.getChannels()
    })
  }

  activateChannel = () => {
    axios.post(`/api/channels/activate/${id}`)
    .then((res) => {
      this.getChannels()
    })
  }

  deletePlaylist = (id) => {
    axios.delete(`/api/playlists/${id}`)
    .then((res) => {
      this.getPlaylists()
    })
  }

  deleteProgram = (id) => {
    axios.delete(`/api/programs/${id}`)
    .then((res) => {
      this.getPrograms()
    })
  }

  deletePix = (id) => {
    axios.delete(`/api/pix/${id}`)
    .then((res) => {
      this.getPix()
    })
  }

  deleteComment = (id) => {
    axios.delete(`/api/comments/${id}`)
    .then((res) => {
      this.getComments()
    })
  }

  deleteUser = (id) => {
    axios.delete(`/api/users/${id}`)
    .then((res) => {
      this.getUsers()
    })
  }

  lockUser = (id) => {
    axios.put(`/api/users/lock/${id}`)
    .then((res) => {
      this.getUsers()
    })
  }

  unlockUser = (id) => {
    axios.put(`/api/users/unlock/${id}`)
    .then((res) => {
      this.getUsers()
    })
  }

  promoteUser = (id) => {
    axios.put(`/api/users/elevate/${id}`)
    .then((res) => {
      this.getUsers()
    })
  }

  demoteUser = (id) => {
    axios.put(`/api/users/demote/${id}`)
    .then((res) => {
      this.getUsers()
    })
  }

  componentDidMount() {
    this.getChannels()
    this.getUsers()
    this.getPix()
    this.getComments()
    this.getPlaylists()
    this.getTimeslots()
    this.getPrograms()
  }

  render() {
    var channels = this.state.channels
    var users = this.state.users
    var pix = this.state.pix
    var comments = this.state.comments
    var playlists = this.state.playlists
    var timeslots = this.state.timeslots
    var programs = this.state.programs

    return (
      <div style={{margin:"25px"}}>
        <h4>Channels</h4>
        {channels.map((channel) => {return <div>{channel.id}{channel.name}
          {channel.active?<button onClick={this.deactivateChannel} style={{fontSize:"10px"}}>deactivate</button>:<button onClick={this.activateChannel} style={{fontSize:"10px"}}>deactivate</button>}
          <button onClick={this.deleteChannel} style={{fontSize:"10px"}}>delete</button>
        </div>})}
        <h4>Users</h4>
        {users.map((user) => {
          return <div>{user.id}{user.name}
          {user.locked?<button onClick={this.unlockUser} style={{fontSize:"10px"}}>unlock</button>:<button onClick={this.lockUser} style={{fontSize:"10px"}}>lock</button>}
          {this.props.user.superAdmin?(user.admin?<button onClick={this.demoteUser} style={{fontSize:"10px"}}>de-elevate</button>:<button onClick={this.promoteUser} style={{fontSize:"10px"}}>elevate</button>):null}
          <button style={{fontSize:"10px"}} onClick={this.deleteUser}>delete</button></div>
        })}
        <h4>Pix</h4>
        {pix.map((pix) => {return <span>{pix.id}<PixBlock pix={pix} dim={56}/><button onClick={this.deletePix} style={{fontSize:"10px"}}>delete</button></span>})}
        <h4>Comments</h4>
        {comments.map((comment) => {return <div>{comment.id}<button onClick={this.deleteComment} style={{fontSize:"10px"}}>delete</button></div>})}
        <h4>Playlists</h4>
        {playlists.map((playlist) => {return <div>{playlist.id}{playlist.name}<button onClick={this.deletePlaylist} style={{fontSize:"10px"}}>delete</button></div>})}
        <h4>Programs</h4>
        {programs.map((program) => {return <span>{program.id}<button onClick={this.deleteProgram} style={{fontSize:"10px"}}>delete</button></span>})}
        <h4>Timeslots</h4>
        {timeslots.map((timeslot) => {return <span>{timeslot.id}<button onClick={this.deleteTimeslot} style={{fontSize:"10px"}}>delete</button></span>})}
      </div>
    )
  }
}
