import React, {Component} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'

export default class ChannelBrowse extends Component {
  getNext30 = () => {
    var now = new Date()
    var minutes = now.getMinutes()
    var hours = now.getHours()
    var next5 = []
    var date = new Date()
    if(minutes<=30){
      date.setMinutes(30, 0, 0)
    }else{
      date.setHours(date.getHours() + 1);
      date.setMinutes(0, 0, 0);
    }
    var first_round = date.getTime()
    next5.push({time:first_round})
    next5.push({time:first_round+30*60*1000})
    next5.push({time:first_round+60*60*1000})
    next5.push({time:first_round+90*60*1000})
    next5.push({time:first_round+120*60*1000})

    return next5
  }

  render() {
    var now = new Date().getTime()
    var elem = document.getElementById("scheduleitem0")
    var winwidth = window.innerWidth
    var scaler = winwidth*10
    //show 3 hours in inner width
    //get next 6 30 minute adjacent to current time    


    return (
      <div>
        {this.props.channels.map((channel, i) => {
          return (
            <div id={`scheduleitem${i}`} style={{backgroundColor:"lightblue", margin:"40px 0", height:"100px", width:"100%"}}>
              <Link to={`/tv/${channel.id}`}>{channel.id} - {channel.name}</Link>

              {this.getNext30().map((item) => {
                var time = new Date(item.time)
                var hours = time.getHours()
                var minutes = time.getMinutes()
                return (<div style={{position:'absolute', top:"0px", left:`${winwidth*(item.time-now)/(3*60*60*1000)}px`}}>{`${hours}:${minutes}`}</div>)
              })}

              {channel.timeslots.map((timeslot, i) => {
                return (<div className="timeslotitem" style={{border:"1px solid black", 
                  position:"absolute",
                  overflow:"hidden",
                  height:"100px",
                  left:`${winwidth * (timeslot.starttime - now) / (3*60*60*1000)}px`, 
                  width:`${winwidth * (timeslot.endtime - timeslot.starttime) / (3*60*60*1000)}px`, 
                  backgroundColor:"white"}}>
                  {timeslot.program.id}
                  <img style={{height:"100px", width:"100px"}} src={timeslot.program.thumbnailUrl}></img>
                </div>)
              })}
            </div>
          )
        })}
      </div>
    )
  }
}
