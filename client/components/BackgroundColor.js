import React from 'react'

class BackgroundColor extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount(){
    var now = new Date();

    var hour = now.getHours()+now.getMinutes()/60;
    var month = now.getMonth()
    var month_days = now.getDate()

    var black = Math.floor(42.5*hour-1.77*(hour*hour));

    if(black>255){
      black=255;
    }
    if(black<0){
      black=0;
    }
    black=255
    var month_colors = [
      [175, 236, 240], //Jan
      [175, 240, 233], //Feb
      [175, 240, 208], //March
      [207, 240, 175], //April
      [233, 240, 175], //May
      [240, 229, 175], //Jun
      [240, 223, 175], //Jul
      [240, 213, 175], //Aug
      [240, 193, 175], //Sept
      [240, 175, 240], //Oct
      [209, 175, 240], //Nov
      [175, 181, 240], //Dec
    ]

    var this_color = month_colors[month]
    var next_color
    if (month+1===12){
      next_color = month_colors[0]
    }else{
      next_color = month_colors[month+1]
    }

    var red = this_color[0] + month_days*(this_color[0] - next_color[0])/31
    var green = this_color[1] + month_days*(this_color[1] - next_color[1])/31
    var blue = this_color[2] + month_days*(this_color[2] - next_color[2])/31


    // document.body.style.background = `-webkit-gradient(linear,0% 0%,0% 100%, from(rgba(${red},${green},${blue},1) ), to(rgba(${black},${black},${black},1)) )`;
    // document.body.style.background = `-moz-linear-gradient(top, rgba(${red},${green},${blue},1) 0%, rgba(${black},${black},${black},1) 100%)`;
    // document.body.style.backgroundAttachment = "fixed";
    document.getElementById("topBarContainer").style.background = `-webkit-gradient(linear,0% 0%,0% 100%, from(rgba(${red},${green},${blue},1) ), to(rgba(255,255,255,1)) )`;
    document.getElementById("topBarContainer").style.background =  `-moz-linear-gradient(top, rgba(${red},${green},${blue},1) 0%, rgba(255,255,255,1) 100%)`;   
  }

  render(){
    return (
      <div style={{position:"absolute", overflow:"hidden", height:"100%", width:"100%", zIndex:"-1"}}>
      </div> 
    )
  }
}


export default BackgroundColor