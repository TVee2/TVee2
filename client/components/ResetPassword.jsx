import React, {Component} from 'react'

export default class ResetPassword extends Component {
  constructor() {
    super()

    this.state = {user:null, message:""}
  }

  componentDidMount() {
    axios.get(`/api/users/reset/${this.props.match.params.token}`)
    .then((res) => {
      this.setState({user:res.data})
    })
  }

  passwordUpdate = (e) => {
    var password = document.getElementById("password").value
    var confirmpassword = document.getElementById("confirmpassword").value

    if(password!==confirmpassword){
      this.setState({message:"password and confirm password do not match"})
      return
    }

    axios.post(`/api/users/reset/${this.props.match.params.token}`, {password})
    .then((res) => {
      console.log(res)
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
            <label htmlFor="password">Youtube ID:</label>
            <input type="text" id="password" name="password"/><br/>
            <label htmlFor="confirmpassword">Youtube ID:</label>
            <input type="text" id="confirmpassword" name="confirmpassword"/><br/>
            <input type="submit" value="Upadte Password" />
          </form>       
        :null}
        {this.state.message?<div>{this.state.message}</div>:null}
      </div>
    )
  }
}
