import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PixBlock from './PixBlock'
import PixDownload from './PixDownload'
import PixelLoader from './PixelLoader'
import {fetchOwnPost, deletePost, saveDraft, setPalette} from '../store'
import axios from 'axios'
import history from "../history"
import {defaultProfilePix} from '../defaultPix'

var tabData3 = [
  { name: 'My Pix', isActive: false },
  { name: 'Profile', isActive: true },
];

class Tabs extends React.Component {
  render() {
    return (
      <ul className="nav nav-tabs">
        {tabData3.map((tab) => {
          return (
            <Tab key={tab.name} data={tab} isActive={this.props.activeTab === tab} handleClick={this.props.changeTab.bind(this,tab)} />
          );
        })}
      </ul>
    );
  }
}

class Tab extends React.Component {
  render() {
    return (
      <li onClick={this.props.handleClick} className={this.props.isActive ? "active" : null}>
        <a>{this.props.data.name}</a>
      </li>
    );
  }
}

class OwnProfile extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      me:{},
      page: 1,
      activeTab: tabData3[0]
    }
  }

  handleClick = (tab) => {
    this.setState({activeTab: tab});
  }

  componentDidUpdate(prevProps){
    window.scrollTo(0, 0)
    if(prevProps.self.id !== this.props.self.id){
      this.getOwnProfile()
      this.getPix()
    }
  }

  componentDidMount(){
    this.getOwnProfile()
    this.getPix()
  }

  getOwnProfile = () => {
    if(this.props.self.id){
      axios.get('/auth/me/detailed')
      .then((res)=>{
        var me = res.data
        this.setState({me})
      })
    } 
  }

  getPix = () => {
    if(this.props.self.id){
      this.props.fetchOwnPost({id:this.props.self.id, page:this.state.page});
    } 
  }

  deletePost = (evt) => {
    var r = confirm("Are you sure you want to delete pix?")
    if(r){
      const post = this.props.ownPosts.list.result.rows.find((post) => (post.pix && evt.target.value==post.pix.id) || (post.reel && evt.target.value==post.reel.id));

      axios.delete('/api/posts/'+post.id)
      .then(()=>{
        this.getPix();
      })
    }
  }


  goToEdit = (pix) => {
    this.props.saveDraft({img: pix.img, palette:pix.palette})
    this.props.setPalette(pix.palette)
    history.push(`/edit/${pix.id}`)
  }

  goToProfPicEdit = ()=>{
    this.props.saveDraft({img: this.state.me.profilePicture.pix.img, palette:this.state.me.profilePicture.pix.palette})
    this.props.setPalette(this.state.me.profilePicture.pix.palette)
  }

  handlePrevious = () => {
    this.setState({page:this.state.page-1}, () =>{
      this.getPix()
    })
  }

  handleNext = () => {
    this.setState({page:this.state.page+1}, () =>{
      this.getPix()
    })
  }

  retProfile = () => {
    var me = this.state.me
    return (
      <div className="profileCard row list-group-item" style={{marginBottom:"10px"}}>
        <div className="col-xs-4">
          <div style={{border: "solid 2px black", backgroundColor:"lightgray", padding:"4px", height:"140px", width:"140px"}}>
            <PixBlock adgrab="profile" pix={me.profilePicture?me.profilePicture.pix:defaultProfilePix}/>
          </div>
        </div>
        <div className="col-xs-1">
        </div>
        <div className="col-xs-7">
          <p style={{overflow:'hidden'}}>Name: {me.username}</p>
          <p style={{overflow:'hidden'}}>Email: {me.email}</p>
          <div style={{display:"none"}}><Link id="resetpassword" to="./passwordreset">Change My Password</Link></div>
          <div style={{display:"none"}}><Link id="changeusername" to="./changeusername">Change My Username</Link></div>
          <div onClick={this.goToProfPicEdit}>
            <Link id="changeprofpic" to="./changeprofpic">Change My Profile Pix(only 16x16)</Link>
          </div>
        </div>
        <hr/>
        {
          me&&me.defaultRoom?
                (<div className="selectedDefaultRoomContainer row list-group-item" style={{margin:"10px", width:"100%", border:"none"}}>
                  <h4>Default Room</h4>
                  <div className="col-xs-4">
                    <i className="selectedDefaultRoom"></i>
                  </div>
                  <div className="col-xs-1">
                  </div>
                  <div className="col-xs-7">
                    <p>Room Code: {me.defaultRoom.room_code}</p>
                    <p>Room Name: {me.defaultRoom.name}</p>
                  </div>
                </div>)
              :(<h5>You have not selected a default room.  The board view automatically directs to your default room on login.</h5>)
        }
      </div>
    )
  }

  retOwnPix = () => {
    var posts=this.props.ownList.result.rows;
    var isLoading = this.props.ownPosts?this.props.ownPosts.isLoading:null;
    var page = this.props.ownPosts.list.page
    var pages = this.props.ownPosts.list.pages
    var isPrev = false;
    var isNext = false;
    if(page<pages){
      isNext=true
    }
    if(page>1){
      isPrev=true
    }

    return (
      <div>
        {isLoading?<PixelLoader/>:(posts&&posts.length===0?<p>Create some Pixs!</p>:null)}
        {posts&&posts.length?posts.map((post, i) =>{
          var pix=post.pix
          var d=new Date(pix.createdAt);
          var created_at=d.toDateString()
          var pix_size=pix.size;
          var grab
          var size
          if(pix_size===8){
            size="8X8"
            grab = "kl"
          } else if(pix_size===16) {
            size="16x16"
            grab = "al"
          } else if(pix_size===32) {
            size="32x32"
            grab = "bl"
          }

        return (
          <div className="row list-group-item" key={ pix.id }>
            <div className="row">
              <div className="col-xs-4 no-padding">
                <div key={pix.id} onClick={() =>{console.log(pix.img.toString())}}>     
                  <PixBlock id={pix.id} grab={grab} pix={pix} palette={pix.palette} data={pix.img}/>
                </div>
              </div>
              <div className="col-xs-1">
              </div>                      
              <div className="col-xs-7">
                <h4>Size: {size}</h4>
                <p>Created: {created_at}</p>
                <p>Palette #: {pix.palette}</p>
                <p>Likes: {post.lovers.length}</p>
              </div>
            </div>
            <div className="personButtonContainer">
              <button className = 'hiddenSpacer' ></button>
              <div className="userActionBtn">
                <PixDownload id={pix.id} grab={grab} pix={pix} palette={pix.palette} data={pix.img}/>
              </div>
              <div className="userActionBtn">
                <button value={ pix.id } className = 'editico' onClick={this.goToEdit.bind(this, pix)}></button>
              </div>
              <div className="userActionBtn">
                <button value={ pix.id } className = 'deleteBtn' onClick={this.deletePost}></button>
              </div>
            </div>
          </div>
        )
        }):null}
        <div className="prevNextPagingContainer">
          {isPrev?<button onClick={this.handlePrevious} className="prevArrow"></button>:<div className="hiddenSpacer">spacer</div>}       
          {isNext?<button onClick={this.handleNext} className="nextArrow"></button>:<div className="hiddenSpacer">spacer</div>}
        </div>
      </div>)
  }


  render(){
    return (
      <div>
        {this.props.self?
        <div>
            <Tabs activeTab={this.state.activeTab} changeTab={this.handleClick} />
            {this.state.activeTab.name==="My Pix"?this.retOwnPix():null}        
            {this.state.activeTab.name==="Profile"?this.retProfile():null}
      </div>:null}
      </div>
    )
  }
}

const mapState = (state) => ({
  ownPosts: state.post.ownList,
  isLoading: state.post.ownList.isLoading,
  ownList: state.post.ownList.list,
  count:state.post.ownList.count,
  limit:state.post.ownList.limit,
  page:state.post.ownList.page,
  pages:state.post.ownList.pages,
  self: state.self
});

const mapDispatch = (dispatch) => {
  return {
    fetchOwnPost(id){
      dispatch(fetchOwnPost(id))
    },
    deletePost(id){
      dispatch(deletePost(id))
    },
    saveDraft(arr){
      dispatch(saveDraft(arr))
    },
    setPalette(pall){
      dispatch(setPalette(pall))
    },
  }
}


export default connect(mapState, mapDispatch)(OwnProfile);
