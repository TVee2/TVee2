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
    this.addComment({content: this.state.value}, this.props.channelId)
    this.setState({value: ''})
  }

  componentDidMount() {
    this.props.getComments(this.props.channelId)
  }

  addComment = (comment, channelId) => {
    axios.post(`/api/comments`, comment)
    .catch((err) => {
      console.log(err)
    })
  }

  render() {
    let list = this.props.comments.slice().reverse()
    const user = this.props.user
    var display_chat

    return (
      <div style={{border: "1px solid black", position:"absolute", left:"640px", display:"inline-block", margin:"0 20px", visibility:display_chat}}>
        <h1 className="center">***Sample Channel Name Here***</h1>
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
        :<h3>User is logged out and unable to post & upvote but can view</h3>
        }
      </div>
    )
  }
}