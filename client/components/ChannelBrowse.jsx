import React, {Component} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'

export default class ChannelBrowse extends Component {
  componentDidMount(){
    this.props.getChannels()
  }

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
    next5.push({time:first_round+150*60*1000})

    return next5
  }

  render() {
    var now = new Date().getTime()
    var elem = document.getElementById("scheduleitem0")
    var winwidth = window.innerWidth
    var scaler = winwidth*10 

    return (
      <div>
        {this.props.channels.map((channel, i) => {
          return (
            <div>
              <div><Link to={`/tv/${channel.id}`}>{channel.id} - {channel.name}</Link></div>
              {this.getNext30().map((item) => {
                var time = new Date(item.time)
                var hours = time.getHours()
                var minutes = time.getMinutes()
                return (<span style={{position:'absolute', left:`${winwidth*(item.time-now)/(3*60*60*1000)}px`}}>{`${hours}:${minutes}`}</span>)
              })}
            <div id={`scheduleitem${i}`} style={{backgroundColor:"lightblue", margin:"20px 0", height:"100px", width:"100%"}}>
              {channel.timeslots.map((timeslot, i) => {
                if(i==0){
                  var left = winwidth * (timeslot.starttime - now) / (3*60*60*1000)
                  var width = (winwidth * (timeslot.endtime - timeslot.starttime) / (3*60*60*1000)) + left
                  left = 0
                }else{
                  var left = winwidth * (timeslot.starttime - now) / (3*60*60*1000)
                  var width = (winwidth * (timeslot.endtime - timeslot.starttime) / (3*60*60*1000))
                }
                return (<div
                  id={`za${timeslot.id}`}
                  onMouseLeave={() => {document.getElementById(`za${timeslot.id}`).classList.toggle('overflowhidden'); document.getElementById(`zz${timeslot.id}`).classList.toggle('zout')}}
                  onMouseEnter={() => {document.getElementById(`za${timeslot.id}`).classList.toggle('overflowhidden'); document.getElementById(`zz${timeslot.id}`).classList.toggle('zout')}}
                  className="timeslotitem overflowhidden"
                  style={{border:"1px solid black", 
                    position:"absolute",
                    height:"100px",
                    left:`${left}px`, 
                    width:`${width}px`, 
                    backgroundColor:`${timeslot.program.color}`}}
                  >
                  <div id={`zz${timeslot.id}`} style={{width:"200px", position:"absolute",  backgroundColor:`${timeslot.program.color}`}} className=''>
                    {timeslot.program.title}
                    <div><a href={`https://www.youtube.com/watch?v=${timeslot.program.youtubeId}`}>{`youtube.com/watch?v=${timeslot.program.youtubeId}`}</a></div>
                    <div>{`Starttime: ${new Date(parseInt(timeslot.starttime)).toLocaleTimeString()}`}</div>
                    <div>{`Endtime: ${new Date(parseInt(timeslot.endtime)).toLocaleTimeString()}`}</div>
                    <img style={{height:"100px", width:"100px"}} src={timeslot.program.thumbnailUrl}></img>
                  </div>
                </div>)
              })}
            </div>
          </div>
          )
        })}
      </div>
    )
  }
}
