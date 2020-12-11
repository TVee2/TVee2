import React, {Component} from 'react'
import {Link} from 'react-router-dom'

export default class Generic extends Component {
  constructor() {
    super()

    this.state = {}
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <nav>
          <div>
            {/* The navbar will show these links after you log in */}
            <Link to="/manage/videos">Videos</Link>
            <Link to="/manage/lists">Lists</Link>
            <Link to="/manage/channels">Channels</Link>
            <Link to="/manage/me">Me</Link>
            <Link to="/manage/devtools">Devtools</Link>
          </div>
        </nav>
        <hr />
      </div>
    )
  }
}
