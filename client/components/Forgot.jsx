import React, {Component} from 'react'
import axios from 'axios'

export default class Forgot extends Component {
  constructor() {
    super()

    this.state = {user:null, message:""}
  }

  enterEmail = (e) => {
    e.preventDefault()
    var email = document.getElementById("email").value

    axios.post(`/api/users/forgot`, {email})
    .then((res) => {
      this.setState({message:"An email has been sent to the email address on file"})
    })
    .catch((err) => {
      this.setState({message:err.message})
    })
  }

  render() {
    return (
      <div>
          <form onSubmit={this.enterEmail}>
            <label htmlFor="email">Email Address:</label>
            <input type="text" id="email" name="email"/><br/>
            <input type="submit" value="Reset Password" />
          </form>
        {this.state.message?<div>{this.state.message}</div>:null}
      </div>
    )
  }
}
