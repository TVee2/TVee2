import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {logout} from '../store'
import BackgroundColor from './BackgroundColor'
import history from '../history'

class Navbar extends Component {
  constructor(props) {
    super(props)

    this.state = {}
  }

  componentDidMount() {
    window.onresize = () => {
      this.forceUpdate()
    }
  }

  render() {
    return (
      <div id="topBarContainer" style={{height:"72px", position:"absolute", zIndex:"11", backgroundColor:"white", width:"100%"}}>
        <BackgroundColor/>
        <nav>
          <div style={{display:"flex", justifyContent:"space-between"}}>
            <div style={{margin:"0 14px"}}>
              <Link className="headerButton home" to="/home"></Link>
              <div onClick={()=>{history.push('/home')}} className="logoword" style={{cursor:"pointer", display:window.innerWidth<450?"none":"inline-block"}}></div>
            </div>

            {this.props.isLoggedIn ? (
              <div style={{margin:"0 14px"}}>
                <Link className="headerButton browse" to="/tvbrowse"></Link>
                <Link className="headerButton manage" to="/manage"></Link>
                {this.props.isAdmin?<Link className="headerButton admin" to="/admin"></Link>:null}
                <div style={{display:"inline-block"}}>
                  <a className="headerButton logout" href="#" onClick={this.props.handleClick}></a>
                </div>
              </div>
            ) : (
              <div style={{margin:"0 14px"}}>
                <Link className="headerButton browse" to="/tvbrowse"></Link>
                <Link className="headerButton login" to="/login"></Link>
              </div>
            )}

          </div>
        </nav>
      </div>
    )
  }
}

/**
 * CONTAINER
*/

const mapState = state => {
  return {
    isLoggedIn: !!state.user.id,
    isAdmin: !!state.user.admin
  }
}

const mapDispatch = dispatch => {
  return {
    handleClick() {
      dispatch(logout())
    }
  }
}

export default connect(mapState, mapDispatch)(Navbar)

/**
 * PROP TYPES
 */
Navbar.propTypes = {
  handleClick: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}

