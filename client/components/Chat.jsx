import React from 'react'
import ReactDOM from 'react-dom'
import axios from 'axios'
import {Provider} from 'react-redux'
import store from './pix/store'
import CreatePix from './pix/components/CreatePix'
import PixBlock from './pix/components/PixBlock'
import ListPix from './pix/components/ListPix'
import "./pix/styles.css";
import PixBar from './PixBar'

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      value: '',
      isCreateSelected:false,
      isListSelected:false,
      isChatSelected:true,
      showPlippiBar:false,
      selectedPix:null
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

  selectPixHandler = (pix) => {
    this.setState({selectedPix:pix})
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
            <div className="comment-container" id="commentcontainer" style={{height:"500px", overflow:"overlay", padding:"10px", backgroundColor:"ivory"}}>
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
                {this.props.user.email}:
                {!this.state.showPlippiBar?<div>
                  <form onSubmit={this.handleSubmit}  disabled={this.state.submitDisabled} className="center" style={{padding:"5px", display:"flex"}}>
                    <input type="text" style={{ margin:"10px", padding:'5px', width:"100%"}} className="comment-input" name="comment" placeholder="Submit a Comment!" value={this.state.value} onChange={this.handleFormChange}/>
                  </form>
                </div>:
                <div>
                  <div style={{height:'74px', margin:"10px", padding:'5px', display:'flex', border:"1px solid black"}}>
                    {this.state.selectedPix?<PixBlock pix={this.state.selectedPix} adgrab={"input"} dim={64}/>:null}
                    <button style={{position:"absolute", right:"15px"}}>Submit</button>
                  </div>
                  <PixBar selectPixHandler={this.selectPixHandler}/>
                </div>}
                <button className="videobutton plippi" onClick={() => {this.setState({showPlippiBar:!this.state.showPlippiBar})}}/>
              </div>
            :<h3>Login to chat</h3>
            }
          </div>:null}

          {this.state.isCreateSelected?<CreatePix handleChatClick={this.handleChatClick}/>:null}
          {this.state.isListSelected?<ListPix handleCreateClick={this.handleCreateClick}/>:null}
        </div>
      </Provider>
    )
  }
}
