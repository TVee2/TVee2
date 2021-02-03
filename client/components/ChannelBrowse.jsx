import React, {Component} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'
import history from '../history'

export default class ChannelBrowse extends Component {
  constructor(){
    super()
  }

  componentDidMount(){
    this.props.getChannelsPage()
    window.addEventListener('resize', this.updateSize)
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.updateSize)   
  }

  updateSize = () => {
    this.forceUpdate()
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
    var winwidth = document.body.clientWidth;

    var scaler = winwidth*10 
    return (
      <div>
        {this.props.page!==1?<button onClick={this.props.getFirstPage}>First</button>:null}
        {this.props.page!==1?<button onClick={this.props.getPrevPage}>Prev</button>:null}
        <span> Page: {this.props.page} </span>
        {this.props.page!==this.props.pages?<button onClick={this.props.getNextPage}>Next</button>:null}
        {this.props.page!==this.props.pages?<button onClick={this.props.getLastPage}>Last</button>:null}
        <br/>
        {this.props.channels.map((channel, i) => {
          var widthAccumulator = 0
          return (
            <div style={{border:"dashed black 2px", margin:"15px 0"}}>
              <div style={{display:"flex", margin:"10px 0 2px 0"}}>
                <div style={{margin:"0 8px"}}><Link to={`/tv/${channel.id}`}>{channel.id} - {channel.name}</Link></div>
                <button onClick={() => {history.push(`/tv/${channel.id}`)}}>GO TO CHANNEL</button>
              </div>
              {this.getNext30().map((item) => {
                var time = new Date(item.time)
                var hours = time.getHours()
                var minutes = time.getMinutes()
                return (<span style={{position:'absolute', left:`${winwidth*(item.time-now)/(3*60*60*1000)}px`}}>{`${hours}:${minutes}`}</span>)
              })}

            <div id={`scheduleitem${i}`} style={{backgroundColor:"lightblue", margin:"20px 0 10px 0", height:"100px", width:"100%"}}>
              {
               channel.timeslots.map((timeslot, i) => {
                if(i==0){
                  var left = Math.floor(winwidth * (timeslot.starttime - now) / (3*60*60*1000))
                  var width = Math.floor((winwidth * (timeslot.endtime - timeslot.starttime) / (3*60*60*1000)) + left)
                  if(left<0){
                    left = 0
                  }
                }else{
                  var left = Math.floor(winwidth * (timeslot.starttime - now) / (3*60*60*1000))
                  var width = Math.floor((winwidth * (timeslot.endtime - timeslot.starttime) / (3*60*60*1000)))
                }
                  widthAccumulator+=width
                  if(widthAccumulator>winwidth){
                    width=winwidth-left
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
        {this.props.page!==1?<button onClick={this.props.getFirstPage}>First</button>:null}
        {this.props.page!==1?<button onClick={this.props.getPrevPage}>Prev</button>:null}
        <span> Page: {this.props.page} </span>
        {this.props.page!==this.props.pages?<button onClick={this.props.getNextPage}>Next</button>:null}
        {this.props.page!==this.props.pages?<button onClick={this.props.getLastPage}>Last</button>:null}
        <br/><br/>
        <br/><br/>
        <br/><br/>
      </div>
    )
  }
}
