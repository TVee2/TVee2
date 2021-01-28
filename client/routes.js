import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Route, Switch, Redirect} from 'react-router-dom'
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
import Forgot from './components/Forgot'
import obj from './components/VideoPlayer'
import axios from 'axios'
var Ytplayer = obj.Ytplayer

/**
 * COMPONENT
 */

class Routes extends Component {
  constructor() {
    super()

    this.state = {channels:[], showCover:true, chtimeslots:[], muted:true, dirty:false, page: 1, pages:null}
  }

  componentDidMount() {
    this.props.loadInitialData()

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
    this.getChannelsPage()
  }

  removeCover = () => {
    this.setState({showCover:false})
  }

  toggleParentStateMuted = () => {
    this.setState({muted: !this.state.muted})
  }

  getNextPage = () => {
    this.setState({page:this.state.page+1}, () => {
      this.getChannelsPage()
    })
  }

  getFirstPage = () => {
    this.setState({page:1}, () => {
      this.getChannelsPage()
    })
  }

  getPrevPage = () => {
    this.setState({page:this.state.page-1}, () => {
      this.getChannelsPage()
    })
  }

  getLastPage = () => {
    this.setState({page:this.state.pages}, () => {
      this.getChannelsPage()
    })
  }

  getChannelsPage = () => {
    axios.get(`/api/channels/page/${this.state.page}`)
    .then((res) => {
      this.setState({channels:res.data.result, pages:res.data.pages})
    })
  }

  render() {
    const {isLoggedIn, isAdmin} = this.props
    return (
      <Switch>
        {/* Routes placed here are available to all visitors */}
        <Route path="/home" component={Home} />
        <Route path="/entrance" component={Entrance} />
        <Route path="/tv/:channelId" render={(props) => (
          <TV  {...props}
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
        <Route path="/forgot" render={(props) => (
            <Forgot {...props}/>
          )}
        />
        <Route path="/users/:id" render={(props) => (
            <SingleUser {...props} user={this.props.user}/>
          )}
        />
        <Route path="/tvbrowse" render={(props) => (
            <ChannelBrowse 
            channels={this.state.channels}
            getLastPage={this.getLastPage}
            getPrevPage={this.getPrevPage}
            getFirstPage={this.getFirstPage}
            getNextPage={this.getNextPage}
            page={this.state.page}/>
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
          <Route path="/manage" render={(props) => (
              <Scheduler  {...props} user={this.props.user}/>
            )}
          />
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
