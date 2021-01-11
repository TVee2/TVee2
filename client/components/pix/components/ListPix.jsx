import React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PixBlock from './PixBlock'
import PixDownload from './PixDownload'
import PixelLoader from './PixelLoader'
import {fetchOwnPost, deletePost, saveDraft, setPalette} from '../store'
import axios from 'axios'
import history from '../../../history'
import {defaultProfilePix} from '../defaultPix'

class OwnProfile extends React.Component {
  constructor(props) {
    super(props)
    this.state={
      me:{},
      page: 1,
      pixList:{list:{result: [], count: 0, limit: 0, page: 1, pages: 0}, isLoading:false},
    }
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
    axios.get('/auth/me/detailed')
    .then((res)=>{
      var me = res.data
      this.setState({me})
    })
  }

  getPix = () => {
    axios.get(`/api/pix/${this.state.page}`)
    .then((ret) => {
      this.setState({pixList:ret.data})
    })
  }

  deletePost = (evt) => {
    var r = confirm("Are you sure you want to delete pix?")
    if(r){
      const post = this.state.pixList.result.find((pix) => (pix && evt.target.value==pix.id));

      axios.delete('/api/pix/'+post.id)
      .then(()=>{
        this.getPix();
      })
    }
  }

  goToEdit = (pix) => {
    this.props.saveDraft({img: pix.img, palette:pix.palette})
    this.props.setPalette(pix.palette)
    this.props.navRelay()
  }

  goToProfPicEdit = ()=>{
    this.props.saveDraft({img: this.state.me.profilePicture.pix.img, palette:this.state.me.profilePicture.pix.palette})
    this.props.setPalette(this.state.me.profilePicture.pix.palette)
    this.props.navRelay()
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

  render(){
    var posts=this.state.pixList.result
    var isLoading = this.state.pixList?this.state.pixList.isLoading:null
    var page = this.state.pixList.page
    var pages = this.state.pixList.pages
    var isPrev = false;
    var isNext = false;
    if(page<pages){
      isNext=true
    }
    if(page>1){
      isPrev=true
    }
    if(posts && posts.length==0){
      return (<div>there dont appear to be any submitted pix</div>)
    }
    return (
      <div>
        {isLoading?<PixelLoader/>:(posts&&posts.length===0?<p>Create some Pixs!</p>:null)}
        {posts&&posts.length?posts.map((post, i) =>{
          var pix=post
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
                  <PixBlock id={pix.id} dim={56} grab={grab} pix={pix} palette={pix.palette}/>
                </div>
              </div>
              <div className="col-xs-1">
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
