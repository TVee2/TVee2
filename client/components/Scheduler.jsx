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
import Devtools from './Devtools'

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
      utype:"aws",
      selectedChannelId:null,
      timeslotuploadloading:false,
      frequency:"single",
      timeslots: { before_ts:[], after_ts:[] },
      videos:[],
      uploads:[]
    }
  }

  componentDidMount(){
    this.getMyVids()
    // this.getMyPlaylistItems()
    this.getChannels()
  }

  componentWillUnmount(){
    socket.off()
  }

  getMyVids = () => {
    axios.get('/api/videos')
    .then((ret) => {
      this.setState({videos:ret.data})
    })
  }

  getMyPlaylistItems = () => {
    axios.get('/api/playlist/items')
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

  // videoSubmit = e => {
  //   e.preventDefault()
  //   var title = document.getElementById("title").value
  //   var url = ''
  //   if(this.state.utype==="aws"){
  //     const formData = new FormData()
  //     var upload = this.state.uploads[0]
  //     var type = upload.type.split('/')[0]
  //     var ext = upload.type.split('.')[1]
  //     if(ext!=="mp4"){
  //       console.log("only mp4 movies allowed")
  //       return
  //     }

  //     if(type!=="video"){console.log("only for submitting movies"); return}
  //     axios.get('/api/videos/awspresignedpost')
  //     .then((res) => {
  //       var key = Date.now() + "." + ext
  //       Object.entries(res.data.path.fields).forEach(([k, v]) => {
  //         formData.append(k, v);
  //       });
  //       console.log(key)
  //       formData.set('key', key)
  //       formData.append('file', this.state.uploads[0])
  //       axios
  //         .post(res.data.path.url, formData, {
  //           headers: {'Content-Type': 'multipart/form-data'},
  //           onUploadProgress: progressEvent => this.setState({isUploading:true, uploadStatement:`uploading... ${Math.round((progressEvent.loaded/upload.size)*100)}%`})
  //         })
  //         .then(ret => {
  //           console.log("uploaded to aws")
  //           this.setState({isUploading:true, uploadStatement:'creating metadata'})
  //           axios.post('/api/videos/aws/metadata', {key, title})
  //           .then(() => {
  //             this.setState({isUploading:false})
  //             this.getMyVids()
  //           })
  //         })
  //         .catch(err => {
  //           console.log(err)
  //         })
  //     })
  //   }else if(this.state.utype==="local"){
  //     url = '/api/videos'

  //     const formData = new FormData()
  //     var upload = this.state.uploads[0]
  //     var type = upload.type.split('/')[0]
  //     var ext = upload.type.split('/')[1]
  //     if(ext!=="mp4"){
  //       console.log("only mp4 movies allowed")
  //       return
  //     }
  //     if(type!=="video"){console.log("only for submitting movies"); return}
  //     formData.set('title', title)
  //     formData.append('videofile', this.state.uploads[0])
  //     axios
  //       .post(url, formData, {
  //         headers: {'Content-Type': 'multipart/form-data'},
  //         onUploadProgress: progressEvent => this.setState({isUploading:true, uploadStatement:`uploading... ${Math.round((progressEvent.loaded/upload.size)*100)}%`})
  //       })
  //       .then(ret => {
  //         console.log("uploaded to local storage")
  //         this.setState({isUploading:false})
  //         this.getMyVids()
  //       })
  //       .catch(err => {
  //         console.log(err)
  //       })
  //   }
  // }

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

  setUtype = (e) => {
    const { name, value } = e.target;
    this.setState({utype:e.target.value})
  }

/*        {!this.state.isUploading?
        (<div>Upload Video
        <form onSubmit={this.videoSubmit}>
          <input
            type="file"
            name="videofile"
            onChange={this.onVideoChange}
            alt="image"
          />
          <div onChange={this.setUtype} style={{display:"flex", margin:"0"}}>
            <input type="radio" defaultChecked id="aws" name="utype" value="aws"/>
            <label htmlFor="aws">AWS</label>
            <input type="radio" id="local" name="utype" value="local"/>
            <label htmlFor="local">Local</label>
          </div>
          <br/>
          <label htmlFor="title">Video Title:</label>
          <input type="text" id="title" name="title"/><br/>
          <input type="submit" value="Upload!" />
        </form></div>):(<div>{this.state.uploadStatement}</div>)}*/

  youtubeIdSubmit = (e) => {
    e.preventDefault()
    var yid = document.getElementById("yid").value
    axios.post('/api/videos/youtubelink', {yid})
    .then((res) => {
      this.getMyVids()
    })
    .catch((err) => {})
  }

  render() {
    return (
      <div>
        <ManageHeader/>


        <Route path={this.props.match.url + "/videos"} render={(props) => (
            <ManageVideos videos={this.state.videos} getMyVids={this.getMyVids}/>
          )}
        />
        <Route path={this.props.match.url + "/lists"} render={(props) => (
            <ManageLists/>
          )}
        />
        <Route path={this.props.match.url + "/channels"} render={(props) => (
            <ManageChannels channelSubmit={this.channelSubmit}/>
          )}
        />
        <Route path={this.props.match.url + "/me"} render={(props) => (
            <ManageMe/>
          )}
        />
        <Route path={this.props.match.url + "/devtools"} render={(props) => (
            <Devtools bombsegments={this.bombsegments}/>
          )}
        />


        <br />
        <br/><br/>
        <br/><br/>
        <br/><br/>
        <br/><br/>
        <br/><br/>
        <div>Select a channel</div>
        <select id="channel" defaultValue={'DEFAULT'} onChange={this.onChannelChange}>
          <option disabled value='DEFAULT'> -- select an option -- </option>
          {this.state.channels.map(ch => {
            return <option value={`${ch.id}`}>{ch.id} - {ch.name}</option>
          })}
        </select>
        {this.state.selectedChannelId?
          <div>
            <br />
            <br />
            <br />
            <br />

            <br />
            <br />
            <br />
            <br />
            <div>Add Video to Timeslot</div>
            {this.state.timeslotuploadloading?
              <div>Creating Timeslot - {`${this.state.segmentLoadingMessage}`}</div>:
              <div>
                <div>
                  Video:
                  <select id="vid">
                    {this.state.videos.map(vid => {
                      return <option value={`${vid.title}`}>{vid.title}</option>
                    })}
                  </select>
                </div>
                <div>
                  Singleton or Daily Recurring:
                  <select id="frequency" defaultValue='single' onChange={ (e) => {this.setState({frequency: e.target.value})} }>
                    <option value='single'>Single</option>
                    <option value='dailyrecurring'>Daily Recurring</option>
                  </select>
                </div>
                <div>
                  Startdate
                  <DatePicker selected={this.state.startdate} onSelect={ date => { this.setState( { startdate: date } ) } } />
                  Starttime: Hour:{' '}
                  <select id="hr">
                    <option value="6">6am</option>
                    <option value="7">7am</option>
                    <option value="8">8am</option>
                    <option value="9">9am</option>
                    <option value="10">10am</option>
                    <option value="11">11am</option>
                    <option value="12">12pm</option>
                    <option value="13">1pm</option>
                    <option value="14">2pm</option>
                    <option value="15">3pm</option>
                    <option value="16">4pm</option>
                    <option value="17">5pm</option>
                    <option value="18">6pm</option>
                    <option value="19">7pm</option>
                    <option value="20">8pm</option>
                    <option value="21">9pm</option>
                    <option value="22">10pm</option>
                    <option value="23">11pm</option>
                    <option value="0">12am</option>
                    <option value="1">1am</option>
                    <option value="2">2am</option>
                    <option value="3">3am</option>
                    <option value="4">4am</option>
                    <option value="5">5am</option>
                  </select>{' '}
                  Min:<select id="min">
                  {Array(60).fill(null).map((item, i) => {
                    return <option value={i}>{i}</option>
                  })}
                  </select>
                  Sec:<select id="sec">
                  {Array(60).fill(null).map((item, i) => {
                    return <option value={i}>{i}</option>
                  })}
                  </select>
                </div>
                <button onClick={this.timeslotSubmitHandler}>submit</button>
              </div>
            }
            <br />
            <br />
            <br />
            <br />
            <br />
            <div>Current Datetime - {new Date().toLocaleString()}</div>
            <div>Scheduled for Before Now</div>
            {this.state.timeslots.before_ts.map((ts) => {
              return <div>Title - {ts.program.title}   &&    Timeslot - {new Date(parseInt(ts.starttime)).toLocaleString()} - {new Date(parseInt(ts.endtime)).toLocaleString()}</div>
            })}
            <div>Scheduled for After Now</div>
            {this.state.timeslots.after_ts.map((ts) => {
              return <div>Title - {ts.program.title}   &&    Timeslot - {new Date(parseInt(ts.starttime)).toLocaleString()} - {new Date(parseInt(ts.endtime)).toLocaleString()}</div>
            })}
          </div>

          :null}
      </div>
    )
  }
}
