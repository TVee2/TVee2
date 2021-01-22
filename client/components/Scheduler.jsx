import React, {Component} from 'react'
import axios from 'axios'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import io from 'socket.io-client'
import {Link} from 'react-router-dom'
import ManageHeader from './ManageHeader'
import {withRouter, Route, Switch} from 'react-router-dom'
import ManageVideos from './ManageVideos'
import ManageLists from './ManageLists'
import ManageChannels from './ManageChannels'
import ManageMe from './ManageMe'

var socket = io()

export default class Scheduler extends Component {
  constructor() {
    super()

    this.state = {
      playlistItems:[],
      startdate:new Date(),
      segmentLoadingMessage:null,
      isUploading:false,
      uploadProgress:0,
      channels:[],
      selectedChannelId:null,
      timeslotuploadloading:false,
      frequency:"single",
      timeslots: { before_ts:[], after_ts:[] },
      videos:[],
      uploads:[]
    }
  }

  componentDidMount(){
    window.onresize =  () => {
      this.forceUpdate()
    }
    this.getChannels()
  }

  componentWillUnmount(){
    socket.off()
  }

  getMyPlaylistItems = () => {
    axios.get('/api/playlists/items')
    .then((ret) => {
      this.setState({videos:ret.data})
    })
  }

  getChannelSchedule = () => {
    if(!this.state.selectedChannelId){
      return
    }
    axios.get(`/api/timeslots/${this.state.selectedChannelId}`)
    .then((ret) => {
      this.setState({timeslots:ret.data})
    })
  }

  getChannels = () => {
    axios.get('/api/channels')
   .then((ret) => {
      this.setState({channels:ret.data})
    })
  }

  bombsegments = () => {
    axios.delete('/api/timeslots/all')
   .then((ret) => {
      this.setState({channels:ret.data})
    })
  }

  timeslotSubmitHandler = (e) => {
    if(!this.state.selectedChannelId){
      return
    }

    var recurring = document.getElementById("frequency").value
    var hr = document.getElementById("hr").value
    var min = document.getElementById("min").value
    var sec = document.getElementById("sec").value
    var vid_title = document.getElementById("vid").value
    var startdate = this.state.startdate.setHours(hr, min, sec)

    this.setState({timeslotuploadloading:true})

    var upload_time = new Date().getTime()
    socket.on(upload_time, (e) => {
      this.setState({segmentLoadingMessage:e})
    })

    axios.post(`/api/timeslots/${this.state.selectedChannelId}`, {vid_title, upload_time, date: startdate, recurring})
    .then((res) => {
      this.setState({timeslotuploadloading:false}, () => {
        if(res.data && res.data.conflict_timeslot){
          console.log("timeslot upload conflicts with existing")
        }else{
          this.getChannelSchedule()
        }
      })
    })
    .catch((err) => {console.log(err)})
  }

  onVideoChange = event => {
    this.setState({
      uploads: event.target.files
    })
  }

  channelSubmit = e => {
    e.preventDefault()
    var name = document.getElementById("channelname").value
    axios.post('/api/channels', {name})
    .then((channel) => {
      this.getChannels()
    })
  }

  onChannelChange = (e) => {
    this.setState({selectedChannelId: e.target.value}, () => {
      var d = new Date()
      for(var i = 0 ;i < document.getElementById("hr").options.length; i++){
        if(document.getElementById("hr").options[i].value == d.getHours()){
          document.getElementById("hr").options[i].selected = true
          break
        }
      }
      for(var i = 0 ;i < document.getElementById("min").options.length; i++){
        if(document.getElementById("min").options[i].value == d.getMinutes()){
          document.getElementById("min").options[i].selected = true
          break
        }
      }
      for(var i = 0 ;i < document.getElementById("sec").options.length; i++){
        if(document.getElementById("sec").options[i].value == d.getSeconds()){
          document.getElementById("sec").options[i].selected = true
          break
        }
      }

      this.getChannelSchedule(this.state.selectedChannelId)
    })
  }

  youtubeIdSubmit = (e) => {
    e.preventDefault()
    var yid = document.getElementById("yid").value
    axios.post('/api/videos/youtubelink', {yid})
    .then((res) => {
    })
    .catch((err) => {})
  }

  render() {
    return (
      <div>
        <ManageHeader/>
        <div style={{position:"absolute", top:window.innerWidth<575?"175px":"", left:window.innerWidth<575?"":"130px", margin:"10px"}}>
          <Route path={this.props.match.url + "/lists"} render={(props) => (
              <ManageLists/>
            )}
          />
          <Route path={this.props.match.url + "/channels"} render={(props) => (
              <ManageChannels channelSubmit={this.channelSubmit}/>
            )}
          />
          <Route path={this.props.match.url + "/me"} render={(props) => (
              <ManageMe user={this.props.user}/>
            )}
          />
        </div>
      </div>
    )
  }
}
