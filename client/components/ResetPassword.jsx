import React, {Component} from 'react'
import axios from 'axios'
import history from '../history'

export default class ResetPassword extends Component {
  constructor() {
    super()

    this.state = {userId:null, message:""}
  }

  componentDidMount() {
    axios.get(`/api/users/reset/${this.props.match.params.token}`)
    .then((res) => {
      if(res.data.message){
        this.setState({message:res.data.message})
      }
      this.setState({user:res.data.id})
    })
    .catch((err) => {console.log(err)})
  }

  passwordUpdate = (e) => {
    var password = document.getElementById("password").value
    var confirmpassword = document.getElementById("confirmpassword").value

    if(password!==confirmpassword){
      this.setState({message:"Password and confirm password do not match."})
      return
    }

    axios.post(`/api/users/reset/${this.props.match.params.token}`, {password})
    .then((res) => {
      this.setState({message:"Password has been updated!"})
    })
    .catch((err) => {
      this.setState({message:err})
    })
  }

  render() {
    return (
      <div>
        {this.state.user?
          <form onSubmit={this.passwordUpdate}>
            <label htmlFor="password">New Password</label>
            <input type="password" id="password" name="password"/><br/>
            <label htmlFor="confirmpassword">Confirm Password</label>
            <input type="password" id="confirmpassword" name="confirmpassword"/><br/>
            <input type="submit" value="Update Password" />
          </form>       
        :null}
        {this.state.message?<div>{this.state.message}</div>:null}
      </div>
    )
  }
}
