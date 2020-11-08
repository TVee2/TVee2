import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      value: ''
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleFormChange = this.handleFormChange.bind(this)
  }

  handleFormChange(event) {
    this.setState({value: event.target.value})
  }

  handleSubmit(event) {
    event.preventDefault()
    this.addComment({text: this.state.value}, this.props.channelId)
    this.setState({value: ''})
  }

  componentDidMount() {
    this.getComments(this.props.channelId)
  }

  deleteComment = (id) => {
    axios.delete(`/comments?id=${id}`)
  }

  addComment = (comment, channelId) => {
    axios.post(`/comments`, comment)

  }

  getComments = (channelId) => {
    axios.get(`/comments`)
  }

  voteComment = (commentId, voteIdentifier) => {
    axios.post(`/comments?id=${commentId}&identifier=${voteIdentifier}`)
  }


  render() {
    let list = this.props.comments
    const user = this.props.user

    return (
      <React.Fragment>
        <h1 className="center">***Sample Room Name Here***</h1>
        {this.props.user
          ?<form className="center" onSubmit={this.handleSubmit}>
          <input className="protest-btn" type="submit" value="Submit" disabled={this.state.submitDisabled}/>
          <input type="text" className="protest-input" name="protest" placeholder="Submit a Comment!" value={this.state.value} onChange={this.handleFormChange}/>
          <br/>
        </form>
        :<h3>User is logged out and unable to post & upvote but can view</h3>
        }
        <br/>
        <br/>
        <div className="protest-container">
          {
            list.length
            ?list.map(protest => (
              <div className="protest-bar" style={{backgroundColor: protest.color}} key={protest.id} id={protest.id}>
                <div className="vote-btn-container">
                  <button id={`up${protest.id}`} className="upvote" onClick={this.voteComment.bind(this, protest.id, 'happy')}>Up Vote</button>
                  <button id={`dn${protest.id}`} className="downvote" onClick={this.voteComment.bind(this, protest.id, 'unhappy')}>Dn Vote</button>
                </div>
                <p>Likes: {protest.voteCount}</p>
                <p>{protest.text}</p>
                <button className="del-btn" id={`d${protest.id}`} onClick={this.deleteComment.bind(this, protest)}>Delete</button>
              </div>
            ))
            :null
          }
        </div>
      </React.Fragment>
    )
  }
}
