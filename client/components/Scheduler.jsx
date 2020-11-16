import React, {Component} from 'react'
import axios from 'axios'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default class Scheduler extends Component {
  constructor() {
    super()

    this.state = {channels:[], selectedChannelId:null, frequency:"single", timeslots: { before_ts:[], after_ts:[] }, videos:[], uploads:[]}
  }

  componentDidMount(){
    this.getMyVids()
    this.getChannels()
  }

  getMyVids = () => {
    axios.get('/api/videos')
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

  timeslotSubmitHandler = (e) => {
    if(!this.state.selectedChannelId){
      return
    }

    var recurring = document.getElementById("frequency").value
    var hr = document.getElementById("hr").value
    var min = document.getElementById("min").value
    var sec = document.getElementById("sec").value
    var vid_title = document.getElementById("vid").value
    axios.post(`/api/timeslots/${this.state.selectedChannelId}`, {vid_title, date: this.state.startdate, hr, min, sec, recurring})
    .then((res) => {this.getChannelSchedule()})
    .catch((err) => {console.log(err)})
  }

  onVideoChange = event => {
    this.setState({
      uploads: event.target.files
    })
  }

  videoSubmit = e => {
    e.preventDefault()
    var title = document.getElementById("title").value

    const formData = new FormData()
    formData.append('title', title)
    formData.append('videofile', this.state.uploads[0])

    axios
      .post('/api/videos', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
      .then(res => {
        this.getMyVids()
      })
      .catch(err => {
        console.log(err)
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
    this.setState({selectedChannelId: e.target.value})
    this.getChannelSchedule(e.target.value)
  }

  render() {
    return (
      <div>
        <div>Create a channel</div>
        <form onSubmit={this.channelSubmit}>
          <input type="text" disabled id="channelname" name="channelname"/><br/>
          <input type="submit" disabled value="submit" />
        </form>
        <br />
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
            <div>Upload Video</div>
            <form onSubmit={this.videoSubmit}>
              <input
                type="file"
                name="videofile"
                onChange={this.onVideoChange}
                alt="image"
              />
              <label htmlFor="title">Video Title:</label><br/>
              <input type="text" id="title" name="title"/><br/>
              <input type="submit" value="Upload!" />
            </form>

            <br />
            <br />
            <br />
            <br />
            My Videos:
            <div>Name Duration</div>
            {this.state.videos.map((v) => {
              return <div>{v.title} - {v.duration}</div>
            })}
            <br />
            <br />
            <br />
            <br />
            <div>Add Video to Timeslot</div>
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
                <option value="0">12pm</option>
                <option value="1">1am</option>
                <option value="2">2am</option>
                <option value="3">3am</option>
                <option value="4">4am</option>
                <option value="5">5am</option>
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
