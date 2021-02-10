import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {NavLink} from 'react-router-dom'
import {logout} from '../store'
import BackgroundColor from './BackgroundColor'
import history from '../history'

class Navbar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showManageHamburger:false
    }
  }

  componentDidMount(){
    window.addEventListener('resize', this.updateSize)
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.updateSize)   
  }

  updateSize = () => {
    this.forceUpdate()
  }

  toggleCollapseManageHamburger = () => {
    this.setState({showManageHamburger:!this.state.showManageHamburger})
  }

  onBlurHandler = (e) => {
    if(!e.currentTarget.contains(e.relatedTarget)){
      this.setState({showManageHamburger:false})
    }
  }

  onFocusHandler = (e) => {
    this.setState({showManageHamburger:true})
  }

  render() {
    return (
      <div id="topBarContainer" style={{height:"72px", position:"absolute", zIndex:"13", backgroundColor:"white", width:"100%"}}>
        <BackgroundColor/>
        <nav>
          <div style={{display:"flex", justifyContent:"space-between"}}>
            <div style={{margin:"0 14px"}}>
              <NavLink activeStyle={{ backgroundColor: "papayawhip" }} className="headerButton browse" to="/home"></NavLink>
              <div onClick={()=>{history.push('/home')}} className="logoword" style={{cursor:"pointer", display:window.innerWidth<450?"none":"inline-block"}}></div>
            </div>

            {this.props.isLoggedIn ? (
              <div style={{margin:"0 14px 0 0"}}>
                <NavLink activeStyle={{ backgroundColor: "papayawhip" }} className="headerButton schedule" to="/tvbrowse"></NavLink>
                <div tabIndex="0"
                onFocus={this.onFocusHandler}
                onBlur={this.onBlurHandler}
                style={{display:"inline-block", outline:"none"}}>
                  <div className="headerButton manage" style={{backgroundColor:this.state.showManageHamburger?"papayawhip":"white"}}></div>
                  <div style={{margin:"-13px 8px", width:"100px", visibility:this.state.showManageHamburger?"":"hidden", position:"absolute", backgroundColor:"whitesmoke"}}>
                    <nav>
                      <div>
                        {/* The navbar will show these NavLinks after you log in */}
                        {this.props.isAdmin?<div>
                          <div style={{margin:"1em"}}>
                            <NavLink activeStyle={{ backgroundColor: "papayawhip" }} to="/manage/channels">Channels</NavLink>
                          </div>
                          <div style={{margin:"1em"}}>
                            <NavLink activeStyle={{ backgroundColor: "papayawhip" }} to="/manage/lists">Playlists</NavLink>
                          </div>
                        </div>:null}
                        <div style={{margin:"1em"}}>
                          <NavLink activeStyle={{ backgroundColor: "papayawhip" }} to="/recommend">QuickPlay</NavLink>
                        </div>                        
                        <div style={{margin:"1em"}}>
                          <NavLink activeStyle={{ backgroundColor: "papayawhip" }} to="/manage/me">Me</NavLink>
                        </div>
                        <div style={{margin:"1em"}}>
                          <NavLink activeStyle={{ backgroundColor: "papayawhip" }} to="/howto">README</NavLink>
                        </div>
                      </div>
                    </nav>
                  </div>
                </div>
                <NavLink activeStyle={{ backgroundColor: "papayawhip" }} className="headerButton question" to="/howto"></NavLink>

                {this.props.isAdmin?<NavLink activeStyle={{ backgroundColor: "papayawhip" }} className="headerButton admin" to="/admin"></NavLink>:null}
                <div style={{display:"inline-block"}}>
                  <a className="headerButton logout" href="#" onClick={this.props.handleClick}></a>
                </div>
              </div>
            ) : (
              <div style={{margin:"0 14px"}}>
                <NavLink activeStyle={{ backgroundColor: "papayawhip" }} className="headerButton schedule" to="/tvbrowse"></NavLink>
                <NavLink activeStyle={{ backgroundColor: "papayawhip" }} className="headerButton login" to="/login"></NavLink>
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

