import React, {Component} from 'react'
import {Link} from 'react-router-dom'

export default class Generic extends Component {
  constructor() {
    super()

    this.state = {}
  }

  componentDidMount() {}

  render() {
            {/*<Link to="/manage/videos">Videos</Link>*/}
    return (
      <div style={{width:"100px", display:"inline-block", position:"absolute", backgroundColor:"whitesmoke"}}>
        <nav>
          <div>
            {/* The navbar will show these links after you log in */}
            <Link to="/manage/lists">Playlists</Link>
            <Link to="/manage/channels">Channels</Link>
            <Link to="/manage/me">Me</Link>
          </div>
        </nav>
      </div>
    )
  }
}
