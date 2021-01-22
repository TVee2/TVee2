import React, {Component} from 'react'
import {Link} from 'react-router-dom'

export default class Generic extends Component {
  constructor() {
    super()

    this.state = {}
  }

  componentDidMount() {
    window.onresize =  () => {
      this.forceUpdate()
    }
  }

  render() {
            {/*<Link to="/manage/videos">Videos</Link>*/}
    return (
      <div style={{width:window.innerWidth<575?"100%":"100px", display:"inline-block", position:"absolute", backgroundColor:"whitesmoke"}}>
        <nav>
          <div style={{display:window.innerWidth<575?"flex":""}}>
            {/* The navbar will show these links after you log in */}
            <div style={{margin:"1em"}}>
              <Link to="/manage/lists">Playlists</Link>
            </div>
            <div style={{margin:"1em"}}>
              <Link to="/manage/channels">Channels</Link>
            </div>
            <div style={{margin:"1em"}}>
              <Link to="/manage/me">Me</Link>
            </div>
          </div>
        </nav>
      </div>
    )
  }
}
