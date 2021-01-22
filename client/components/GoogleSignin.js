import React from 'react'
import history from '../history'

class GoogleSignin extends React.Component {
  constructor(props) {
    super(props)
    this.state={clicked:false}
  }

  googleClick = ()=>{
    this.setState({clicked:true})
    history.push('/auth/google')
  }
      // somehow this logs in as google
  render(){
    return (
      <div style={{margin:"15px"}}>
        <a href="/auth/google">
          {this.state.clicked?<div><img src="/icons/google_signin_dark_pressed.png"></img></div>:<div style={{cursor:"pointer"}} onClick={this.googleClick}><img src="/icons/google_signin_norm.png"></img></div>}
        </a>
      </div>
    )      

  }
}


export default GoogleSignin
