import React, {Component} from 'react'
import ManageHeader from './ManageHeader'

export default class Devtools extends Component {
  constructor() {
    super()

    this.state = {}
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        <h1>Devtools</h1>
        <button onClick={this.props.bombsegments}>segment destroy all</button>
        <br/><br/><br/><br/>
      </div>
    )
  }
}
