import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Route, Switch} from 'react-router-dom'
import PropTypes from 'prop-types'
import {Login, Signup, Home} from './components'
import LoginSignup from './components/LoginSignup'
import TV from './components/TV'
import Scheduler from './components/Scheduler'
import Entrance from './components/Entrance'
import {me} from './store'
import ChannelBrowse from './components/ChannelBrowse'
import ManageVideos from './components/ManageVideos'
import ManageLists from './components/ManageLists'
import ManageChannels from './components/ManageChannels'
import ManageMe from './components/ManageMe'
import SingleUser from './components/SingleUser'
import AdminDelete from './components/AdminDelete'
import ResetPassword from './components/ResetPassword'
import obj from './components/VideoPlayer'
import axios from 'axios'
var Ytplayer = obj.Ytplayer

/**
 * COMPONENT
 */

class Routes extends Component {
  constructor() {
    super()

    this.state = {channels:[], showCover:true, chtimeslots:[], muted:true, dirty:false}
  }

  componentDidMount() {
    this.props.loadInitialData()
    this.getChannels()
    this.getChannelsWTimeslots()

    var listener = () => {
      this.setState({muted: false, dirty: true}, () => {
        document.removeEventListener('click', listener)
      })

      this.removeCover()
      if(Ytplayer.player){
        Ytplayer.player.unMute()
      }

    }

    document.addEventListener('click', listener)
  }

  getChannels = () => {
    axios.get('/api/channels')
   .then((ret) => {
      this.setState({channels:ret.data})
    })
  }

  getChannelsWTimeslots = () => {
    axios.get('/api/channels/timeslots')
   .then((ret) => {
      this.setState({chtimeslots:ret.data})
    })
  }

  removeCover = () => {
    this.setState({showCover:false})
  }

  toggleParentStateMuted = () => {
    this.setState({muted: !this.state.muted})
  }

  render() {
    const {isLoggedIn, isAdmin} = this.props
    return (
      <Switch>
        {/* Routes placed here are available to all visitors */}
        <Route path="/home" component={Home} />
        <Route path="/entrance" component={Entrance} />
        <Route path="/tv/:channelId" render={(props) => (
          <TV  {...props} channels={this.state.channels}
            muted={this.state.muted}
            dirty={this.state.dirty}
            showCover={this.state.showCover}
            removeCover={this.removeCover}
            toggleParentStateMuted = {this.toggleParentStateMuted}
            user={this.props.user}
          />)}
        />
        <Route path="/reset/:token" render={(props) => (
            <ResetPassword {...props}/>
          )}
        />
        <Route path="/users/:id" render={(props) => (
            <SingleUser {...props} user={this.props.user}/>
          )}
        />
        <Route path="/tvbrowse" render={(props) => (
            <ChannelBrowse channels={this.state.chtimeslots} getChannels={this.getChannelsWTimeslots}/>
          )}
        />
        <Route path="/login" component={LoginSignup} />
        {isLoggedIn && isAdmin? (
          <Route path="/admin" render={(props) => (
              <AdminDelete {...props} user={this.props.user}/>
            )}
          />
        ):null}
        {isLoggedIn && (
          <Switch>
            {/* Routes placed here are only available after logging in */}
            <Route path="/manage" render={(props) => (
                <Scheduler  {...props} user={this.props.user}/>
              )}
            />
          </Switch>
        )}
        {/* Displays our Login component as a fallback */}
        {isLoggedIn? (
           <Route component={Home} />
        ):<Route component={LoginSignup} />}
      </Switch>
    )
  }
}

/**
 * CONTAINER
 */

const mapState = state => {
  return {
    // Being 'logged in' for our purposes will be defined has having a state.user that has a truthy id.
    // Otherwise, state.user will be an empty object, and state.user.id will be falsey
    isLoggedIn: !!state.user.id,
    isAdmin: !!state.user.admin,
    user: state.user
  }
}

const mapDispatch = dispatch => {
  return {
    loadInitialData() {
      dispatch(me())
    }
  }
}

// The `withRouter` wrapper makes sure that updates are not blocked
// when the url changes
export default withRouter(connect(mapState, mapDispatch)(Routes))

/**
 * PROP TYPES
 */
Routes.propTypes = {
  loadInitialData: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}
