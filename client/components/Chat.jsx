import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      value: '',
      comments:[]
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
    this.getComments(this.props.channelId)
  }

  // deleteComment = (id) => {
  //   axios.delete(`/api/comments?id=${id}`)
  //   .then((comments) => {

  //     console.log(comments)
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })
  // }

  addComment = (comment, channelId) => {
    axios.post(`/api/comments`, comment)
    .then((comments) => {
      console.log(comments)
    })
    .catch((err) => {
      console.log(err)
    })
  }

  getComments = (channelId) => {
    axios.get(`/api/comments`)
    .then((res) => {
      this.setState({comments:res.data})
    })
    .catch((err) => {
      console.log(err)
    })
  }

  // voteComment = (commentId, voteIdentifier) => {
  //   axios.post(`/api/comments?id=${commentId}&identifier=${voteIdentifier}`)
  //   .then((comments) => {
  //     console.log(comments)
  //   })
  //   .catch((err) => {
  //     console.log(err)
  //   })
  // }


  render() {
    let list = this.state.comments
    const user = this.props.user
    return (
      <div style={{border: "1px solid black"}}>
        <h1 className="center">***Sample Channel Name Here***</h1>
        {this.props.user.id
          ?<form className="center" onSubmit={this.handleSubmit}>
          <input className="comment-btn" type="submit" value="Submit" disabled={this.state.submitDisabled}/>
          <input type="text" className="comment-input" name="comment" placeholder="Submit a Comment!" value={this.state.value} onChange={this.handleFormChange}/>
          <br/>
        </form>
        :<h3>User is logged out and unable to post & upvote but can view</h3>
        }
        <br/>
        <br/>
        <div className="comment-container">
          {
            list && list.length
            ?list.map(comment => (
              <div className="comment-bar" style={{backgroundColor: comment.user.color}} key={comment.id} id={comment.id}>
                <p>{comment.content}</p>
                <p>{comment.createdAt}</p>
              </div>
            ))
            :null
          }
        </div>
      </div>
    )
  }
}
