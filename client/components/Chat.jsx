import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import {Provider} from 'react-redux'
import store from './pix/store'
import CreatePix from './pix/components/CreatePix'
import ListPix from './pix/components/ListPix'
// import "./pix/bootstrap.css";
import "./pix/styles.css";


export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      value: '',
      isCreateSelected:false,
      isListSelected:false,
      isChatSelected:true
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

  handleChatClick = () => {
    this.setState({isCreateSelected:false, isListSelected:false, isChatSelected:true})
  }

  handleCreateClick = () => {
    this.setState({isCreateSelected:true, isListSelected:false, isChatSelected:false})
  }

  handleListClick = () => {
    this.setState({isCreateSelected:false, isListSelected:true, isChatSelected:false})
  }

  render() {
    let list = this.props.comments.slice().reverse()
    const user = this.props.user
    var display_chat
    var smallwindow = this.props.smallwindow
    var collapse = this.props.collapse
    var showChat = this.props.showChat
    var visibility = !this.props.collapse || (this.props.collapse && this.props.showChat)//show if no collapse, // show if collapse and showchat is true
    return (
      <Provider store={store}>
        <div style={{zIndex:"10", border: "1px solid black", visibility:visibility?"":"hidden", width:smallwindow?"95%":"300px", position:"absolute", left:smallwindow?"0px":"640px", display:smallwindow?"block":"inline-block", margin:smallwindow?"0px":"0 30px"}}>
          <div className="chat-navbar">
            <button className="videobutton chat" onClick={this.handleChatClick}></button>
            <button className="videobutton createpix" onClick={this.handleCreateClick}></button>
            <button className="videobutton listpix" onClick={this.handleListClick}></button>
          </div>
          {this.state.isChatSelected?<div>
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
              ?<div>
              <form className="center" style={{padding:"5px", display:"flex"}}>
                <input type="text" style={{width:"100%"}} className="comment-input" name="comment" placeholder="Submit a Comment!" value={this.state.value} onChange={this.handleFormChange}/>
              </form>
              <button className="videobutton plippi" onClick={() => {console.log("test")}}/>
              <button className="videobutton chatsubmit" onSubmit={this.handleSubmit} disabled={this.state.submitDisabled}/>
            </div>
            :<h3>Login to chat</h3>
            }
          </div>:null}
          {this.state.isCreateSelected?<CreatePix/>:null}
          {this.state.isListSelected?<ListPix/>:null}
        </div>
      </Provider>
    )
  }
}
