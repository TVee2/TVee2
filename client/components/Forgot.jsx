import React, {Component} from 'react'

export default class Forgot extends Component {
  constructor() {
    super()

    this.state = {user:null, message:""}
  }

  enterEmail = (e) => {
    var email = document.getElementById("email").value

    axios.post(`/api/users/forgot`, {email})
    .then((res) => {
      this.setState({message:"An email has been sent to the email address on file"})
    })
    .catch((err) => {
      this.setState({message:err})
    })
  }

  render() {
    return (
      <div>
        {this.state.user?
          <form onSubmit={this.enterEmail}>
            <label htmlFor="email">Youtube ID:</label>
            <input type="text" id="email" name="email"/><br/>
            <input type="submit" value="Reset Password" />
          </form>
        :null}
        {this.state.message?<div>{this.state.message}</div>:null}
      </div>
    )
  }
}
