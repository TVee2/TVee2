import React, {Component} from 'react'
import axios from 'axios'
import CreatePix from './pix/components/CreatePix'
import {Provider} from 'react-redux'
import PixBar from './PixBar'
import ListPix from './pix/components/ListPix'
import PixBlock from './pix/components/PixBlock'
import store from './pix/store'

var meTabData = [
  { name: 'View/Edit Info', key:"vedit", isActive: true },
  { name: 'Create pix', key:"createpix", isActive: false },
  { name: 'List pix', key:"listpix", isActive: false },
];

class Tabs extends React.Component {
  render() {
    return (
      <ul className="nav nav-tabs">
        {meTabData.map((tab) => {
          return (
            <Tab key={tab.name} data={tab} isActive={this.props.activeTab === tab} handleClick={this.props.changeTab.bind(this, tab)} />
          )
        })}
      </ul>
    )
  }
}

class Tab extends React.Component {
  render() {
    return (
      <li onClick={this.props.handleClick} className={this.props.isActive ? "active" : null}>
        <a>{this.props.data.name}</a>
      </li>
    );
  }
}

export default class ManageMe extends Component {
  constructor() {
    super()

    this.state = {
      activeTab: meTabData[0],
      user:{},
      showPlippiBar: false,
      favorites:[],
      message:"",
    }
  }

  componentDidMount() {
    this.getMe()
    this.getFavorites()
  }

  getMe = () => {
    axios.get('/auth/me/detailed')
    .then((res) => {
      this.setState({user:res.data})
    })
  }

  getFavorites = () => {
    axios.get('/api/channels/favorites')
    .then((res) => {
      this.setState({favorites:res.data})
    })
  }

  handleTabClick = (tab) => {
    this.setState({activeTab: tab})
  }

  goToListTab = () => {
    this.setState({activeTab:meTabData[2]})
  }

  goToCreateTab = () => {
    this.setState({activeTab:meTabData[1]})
  }

  setProfilePix = (pix) => {
    axios.post('/api/users/profilePix', pix)
    .then((res) => {
      this.getMe()
    })
  }

  unfavorite = (id) => {
    axios.post(`/api/channels/favorites/remove/${id}`)
    .then((res) => {
      this.getFavorites()
    })
  }

  passwordUpdate = (e) => {
    e.preventDefault()
    var password = document.getElementById("password").value
    var confirmpassword = document.getElementById("confirmpassword").value

    if(password!==confirmpassword){
      this.setState({message:"password and confirm password do not match"})
      return
    }

    axios.post(`/api/users/resetme`, {password})
    .then((res) => {
    })
    .catch((err) => {
      this.setState({message:err})
    })
  }

  render() {
    return (
      <div>
        <Provider store={store}>
          <h1>Manage self</h1>
          <Tabs activeTab={this.state.activeTab} changeTab={this.handleTabClick} />
          {this.state.activeTab.key=="vedit"?
          <div>
            <div>Switch profile pixel image... <button className="videobutton plippi" onClick={() => {this.setState({showPlippiBar:!this.state.showPlippiBar})}}/></div>
            {this.state.showPlippiBar?<PixBar selectPixHandler={this.setProfilePix} dim={64}/>:null}
            <div style={{backgroundColor:this.state.user.color, margin:"20px"}}>
              <div>Profile picture set to:</div>
              <div><PixBlock adgrab="mprof" pix={this.state.user.profilePix} dim={64}/></div>

              <div>Username: {this.state.user.username}</div>
              <div>Email: {this.state.user.email}</div>
              <div>Member Since: {this.state.user.createdAt}</div>
              <div>{this.state.favorites.map((channel) => {
                return <div>{channel.name}<img src={channel.thumbnailUrl}></img><button onClick={this.unfavorite.bind(this, channel.id)}>unfavorite</button></div>
              })}</div>
            </div>
            <br/><br/>
            <div>Change your password</div>
            <form onSubmit={this.passwordUpdate}>
              <label htmlFor="password">New Password:</label>
              <input type="password" id="password" name="password"/><br/>
              <label htmlFor="confirmpassword">Confirm Password:</label>
              <input type="password" id="confirmpassword" name="confirmpassword"/><br/>
              <input type="submit" value="Update Password" />
            </form>
            <div>{this.state.message}</div>
          </div>
          :null}
          {this.state.activeTab.key=="createpix"?<CreatePix navRelay={this.goToListTab}/>:null}
          {this.state.activeTab.key=="listpix"?<ListPix navRelay={this.goToCreateTab}/>:null}
        </Provider>
      </div>
    )
  }
}
