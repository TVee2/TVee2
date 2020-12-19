import React from 'react'
import { Link } from 'react-router-dom'
import {colors} from '../colors'
import { connect } from 'react-redux'
class PixBlock extends React.Component {
  constructor(props) {
    super(props)
    this.state={dim:null, grab:null}
    this.dataToClasses = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p"]
  }

  componentWillMount(){
    var dim
    if(this.props.dim){
      dim = this.props.dim
    }else{
      dim = window.innerWidth>464?128:96
    }
    this.setState({dim})


    var pix = this.props.pix
    var id = pix.id
    var grab='';
    if(pix.size===8){
      grab += "kl"
    }else if (pix.size===16) {
      grab += "al"
    }else if (pix.size===32) {
      grab += "bl"
    }

    if(this.props.adgrab){
      grab += this.props.adgrab
    }

    this.setState({grab})
  }

  componentDidUpdate(prevProps){
    if(prevProps.pix.img!==this.props.pix.img){
      this.draw()
    }
  }

  draw = () => {
    var pix = this.props.pix
    var id = pix.id

    var c = document.getElementById("myCanvas"+this.state.grab+id)
    var ctx = c.getContext("2d");
    
    var data = pix.img;
    var palette = pix.palette;

    var conv = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p"]
    var edge = Math.sqrt(data.length)
    var size = this.props.drawing_size
    var cell_width
    if(size){
      cell_width=size
    }else{
      cell_width = window.innerWidth>464?128/edge:96/edge
      cell_width = 2*cell_width
    }
    data.forEach((cell, i)=>{
      ctx.fillStyle = colors[conv[palette]][conv[cell]]
      ctx.fillRect(cell_width*(i%edge), cell_width*Math.floor(i/edge), cell_width, cell_width);
    })
  }

  componentDidMount(){
    this.draw()
  }

  render(){
    var pix=this.props.pix
    var data= pix.img;
    var palette = pix.palette;
    var id = pix.id;
    var conv = this.dataToClasses;
    return (
      <div onClick={this.props.onClick} className="bunga" style={{cursor:this.props.pointer?"pointer":null, marginLeft:this.props.lmarg, display:"inlineBlock", height:"100%", fontSize:"0px", padding:`${this.props.tbpad||0}px 0` }}>
        {data&&data.length?<canvas value={this.props.num} style={{height:this.state.dim+"px", width:this.state.dim+"px",}} id={"myCanvas"+this.state.grab+id} width={2*this.state.dim} height={2*this.state.dim}></canvas>:null}
      </div>
    )
  }
}

const mapState = (state) => ({
  color: state.color.selected
});

const mapDispatch = (dispatch) => {
  return {

  }
}

export default connect(mapState, mapDispatch)(PixBlock);
