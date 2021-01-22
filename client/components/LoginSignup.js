import React, { Component } from 'react'
import {Login, Signup} from './'

class LoginSignup extends Component {
  constructor(props){
    super(props)
      this.state = {
        isLogin:true
      };
  }

  toggleLoginSignup=()=>{
    this.setState({isLogin:!this.state.isLogin})
  }

  render(){
    var isLogin = this.state.isLogin
    return (
      <div style={{display:"flex", justifyContent:"center"}}>
        <div style={{margin:"10px"}}>
          <h4>{isLogin?"Sign in...":"Create an account..."} or <button onClick={this.toggleLoginSignup}>{!isLogin?"log in":"create an account"}</button></h4>
          <hr/>
          {isLogin?<Login/>:<Signup/>}
        </div>
      </div>
    )
  }
}

export default LoginSignup;
