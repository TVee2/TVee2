import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      value: '',
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleFormChange = this.handleFormChange.bind(this)
  }

  handleFormChange(event) {
    this.setState({value: event.target.value})
  }

  handleSubmit(event) {
    event.preventDefault()
    this.addComment({content: this.state.value, channelId: this.props.channelId})
    this.setState({value: ''})
  }

  // componentDidMount() {
  //   this.props.getComments(this.props.channelId)
  // }

  addComment = (obj) => {
    axios.post(`/api/comments`, obj)
    .catch((err) => {
      console.log(err)
    })
  }

  // componentDidUpdate(prevProps, prevState){
  //   if(prevProps.channelId !== this.props.channelId){
  //     this.props.getComments(this.props.channelId)
  //   }
  // }

  render() {
    let list = this.props.comments.slice().reverse()
    const user = this.props.user
    var display_chat
    var smallwindow = this.props.smallwindow
    var collapse = this.props.collapse
    var showChat = this.props.showChat
    var visibility = !this.props.collapse || (this.props.collapse && this.props.showChat)//show if no collapse, // show if collapse and showchat is true
    return (
      <div style={{border: "1px solid black", visibility:visibility?"":"hidden", width:smallwindow?"95%":"300px", position:"absolute", left:smallwindow?"0px":"640px", display:smallwindow?"block":"inline-block", margin:smallwindow?"0px":"0 30px"}}>
        <div className="comment-container" id="commentcontainer" style={{height:"600px", overflow:"overlay", padding:"10px", backgroundColor:"ivory"}}>
          {
            list && list.length
            ?list.map(comment => {
              var date = new Date(comment.createdAt)
              return (<div className="comment-bar" style={{backgroundColor: comment.user.color}} key={comment.id} id={comment.id}>
                <p>{comment.user.email}</p>
                <p><span>{date.getHours()+":"+date.getMinutes()}</span> - <span>{comment.content}</span></p>
              </div>)
            })
            :null
          }
        </div>
        {this.props.user.id
          ?<form className="center" style={{padding:"15px", display:"flex"}} onSubmit={this.handleSubmit}>
          <input className="comment-btn" type="submit" value="Submit" disabled={this.state.submitDisabled}/>
          <input type="text" style={{width:"100%"}} className="comment-input" name="comment" placeholder="Submit a Comment!" value={this.state.value} onChange={this.handleFormChange}/>
          <br/>
        </form>
        :<h3>Login to chat</h3>
        }
      </div>
    )
  }
}
