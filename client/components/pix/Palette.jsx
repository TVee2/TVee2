import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {setColor, setPalette} from '../store'

class Palette extends React.Component {
  constructor(props) {
    super(props)
    this.state={palette:this.props.selected.palette||0}
    this.paletteClickHandler = this.paletteClickHandler.bind(this);
    this.switchPalette = this.switchPalette.bind(this);
    this.dataToClasses = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p"]
    this.changeCanvas=this.changeCanvas.bind(this)
  }

  componentDidMount(){
    var initPall = this.props.selected.palette||0
    this.props.setPalette(initPall)
    var pall = this.dataToClasses[initPall]
    var klass = pall+"b"
    this.props.setColor({id:"1", class: klass})
  }

  paletteClickHandler(evt){
    this.props.setColor({id:evt.target.getAttribute('data-status'), class:evt.target.getAttribute('class')})
  }
    
  changeCanvas(){
    var kid = document.getElementById('k0-0')
    var adult = document.getElementById('a0-0')
    var boss = document.getElementById('b0-0')
    
    if(kid){
      for(var i=0;i<8;i++){
      for(var j=0;j<8;j++){
        setTimeout(function(x, pal, dat) { return function() { 
          var pixel = document.getElementById(`k${Math.floor(x/8)}-${x%8}`)
          var pixDat = pixel.getAttribute("data-status")
          pixel.setAttribute("class", dat[pal]+dat[pixDat]); }; }(8*i+j, this.state.palette, this.dataToClasses), (8*i+j)*10);
      }
    }
    setTimeout(()  => {
      this.forceUpdate()
    }, 640)
    }else if(adult){
       for(var i=0;i<16;i++){
      for(var j=0;j<16;j++){
        setTimeout(function(x, pal, dat) { return function() { 
          var pixel = document.getElementById(`a${Math.floor(x/16)}-${x%16}`)
          var pixDat = pixel.getAttribute("data-status")
          pixel.setAttribute("class", dat[pal]+dat[pixDat]); }; }(16*i+j, this.state.palette, this.dataToClasses), (16*i+j)*5);
      }
    }
    setTimeout(()  => {
      this.forceUpdate()
    }, 1280)
    }else if(boss){
      for(var i=0;i<32;i++){
      for(var j=0;j<32;j++){
        setTimeout(function(x, pal, dat) { return function() { 
          var pixel = document.getElementById(`b${Math.floor(x/32)}-${x%32}`)
          var pixDat = pixel.getAttribute("data-status")
          pixel.setAttribute("class", dat[pal]+dat[pixDat]); }; }(32*i+j, this.state.palette, this.dataToClasses), (32*i+j)*1.25);
      }
    }
    setTimeout(() =>{
      this.forceUpdate()
    }, 1280)
    }
  }
  
  switchPalette(){
    var palls = 5;
    var nextPall = (this.props.palette+1)>palls?0:(this.props.palette+1);
    if(nextPall===1){
      nextPall++
    }
    var nextClass = this.dataToClasses[nextPall]+this.dataToClasses[this.props.color.id||1]
    this.setState({palette:nextPall}, () =>{
      this.props.setColor({id:this.props.color.id, class:nextClass})
      this.changeCanvas()
    })
    this.props.setPalette(nextPall)
  }

  render(){
  var pch = this.paletteClickHandler;
  var sp=this.switchPalette;
  var paletteNo = this.dataToClasses[this.props.palette||0];
    return (
      <div className='inflex col-xs-12'  id="pallcont1">
        <div id = "pallcont">
          <div id="wrapper" className="fixflex">
          <div className="containerbox">
            <button id="paletteButt" className="fixflex" onClick={sp}>Switch Palette</button>
            <div className="pallWrapper">
              <div className='bigboxContainer'>
                <div className={`bigbox ${this.props.color.class}`} data-status='99' id='z-z'></div>
              </div>
              <div className="box"><div className={`${paletteNo+"a"}`} data-status='0' id='p0-0' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"b"}`} data-status='1' id='p0-1' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"c"}`} data-status='2' id='p0-2' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"d"}`} data-status='3' id='p0-3' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"e"}`} data-status='4' id='p0-4' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"f"}`} data-status='5' id='p0-5' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"g"}`} data-status='6' id='p0-6' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"h"}`} data-status='7' id='p0-7' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"i"}`} data-status='8' id='p1-0' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"j"}`} data-status='9' id='p1-1' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"k"}`} data-status='10' id='p1-2' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"l"}`} data-status='11' id='p1-3' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"m"}`} data-status='12' id='p1-4' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"n"}`} data-status='13' id='p1-5' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"o"}`} data-status='14' id='p1-6' onClick={pch}></div></div>
              <div className="box"><div className={`${paletteNo+"p"}`} data-status='15' id='p1-7' onClick={pch}></div></div>
            </div>
          </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapState = (state)  => ({
  selected: state.color.selected,
  color : state.color.selected.color,
  palette: state.color.selected.palette
});

const mapDispatch = (dispatch)  => {
  return {
    setColor(color){
      dispatch(setColor(color))
    },
    setPalette(paletteNo){
      dispatch(setPalette(paletteNo))
    }
  }
}


export default connect(mapState, mapDispatch)(Palette);