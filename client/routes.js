import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Route, Switch} from 'react-router-dom'
import PropTypes from 'prop-types'
import {Login, Signup, UserHome} from './components'
import TV from './components/TV'
import Scheduler from './components/Scheduler'
import Entrance from './components/Entrance'
import {me} from './store'
import ChannelBrowse from './components/ChannelBrowse'
import axios from 'axios'

/**
 * COMPONENT
 */

class Routes extends Component {
  constructor() {
    super()

    this.state = {channels:[], showCover:true}
  }

  componentDidMount() {
    this.props.loadInitialData()
    this.getChannels()
  }

  getChannels = () => {
    axios.get('/api/channels')
   .then((ret) => {
      this.setState({channels:ret.data})
    })
  }

  removeCover = () => {
    this.setState({showCover:false})
  }

  render() {
    const {isLoggedIn} = this.props
    return (
      <Switch>
        {/* Routes placed here are available to all visitors */}
        <Route path="/entrance" component={Entrance} />
        <Route path="/tv/:channelId" render={(props) => (
            <TV  {...props} channels={this.state.channels} showCover={this.state.showCover} removeCover={this.removeCover} user={this.props.user}/>
          )}
        />
        <Route path="/tvbrowse" render={(props) => (
            <ChannelBrowse channels={this.state.channels}/>
          )}
        />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        {isLoggedIn && (
          <Switch>
            {/* Routes placed here are only available after logging in */}
            <Route path="/home" component={UserHome} />
            <Route path="/manage" component={Scheduler} />
          </Switch>
        )}
        {/* Displays our Login component as a fallback */}
        <Route component={Login} />
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
