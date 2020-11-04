import React, { Component } from 'react'
import Calendar from './Calendar'
import Scheduler from './Scheduler'
import axios from 'axios'

export default class VidManager extends Component {
  constructor(){
    super()

    this.state={vids:[], schedule:{}}
  }

  componentDidMount() {
    this.getVideos()
    this.getSchedule()
  }

  getVideos=()=>{
    axios.get('/api/src/videos')
    .then((res)=>res.data)
    .then((vids)=>{
      this.setState({vids: vids})
    })
  }

  submitHandler=()=>{
    var slot = {src:document.getElementById("src").value,
    day: document.getElementById("day").value,
    hr: document.getElementById("hr").value,
    min: document.getElementById("min").value}
    axios.post('/api/src/timeslot', slot)
    .then(res=>res.data)
    .then((r)=>{
      this.getSchedule()
    })
  }

  handleUpload=(evt)=>{
    evt.preventDefault()
    axios.post('/api/src/upload', evt.target.files[0])
    .then(res=>res.data)
    .then(()=>{
      this.getVideos()
    })
  }

  getSchedule=()=>{
    axios.get('/api/src/schedule')
    .then(res=>res.data)
    .then((sched)=>{
      this.setState({schedule:sched})
    })
  }

  saveToJSON(){

  }

  render() {

    return (
      <div >
        <Calendar schedule={this.state.schedule}/>
        <Scheduler vids={this.state.vids} submitHandler={this.submitHandler} schedule={this.state.schedule} handleUpload={this.handleUpload}/>
      </div>
    )
  }
}
