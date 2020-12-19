import React from 'react'
import { Link } from 'react-router-dom'

class PixDownload extends React.Component {
  constructor(props) {
    super(props)
    this.state={}
    this.state.dim=null
    this.width = this.state.dim;
    this.height = this.state.dim;
    this.goltable = null;

    this.dataToClasses = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p"]
    this.mouseDown = false;
  }

  download_canvas_image = () => {
    var canvas = document.getElementById(`myCanvas${this.props.grab}${this.props.id}`)
    var image = canvas.toDataURL().replace("image/png", "image/octet-stream");
    var anchor = document.getElementById(`download_${this.props.id}`)
    anchor.setAttribute("href", image)
  }

  render(){
    const grab = this.props.grab;

    var data= this.props.data;
    var id = this.props.id;
    

    return (
      <div className="dl-container" id={`${id}${grab}`}>
        <a id={`download_${id}`} download={`pix_${grab[0]}_${id}.png`}><button onClick={this.download_canvas_image} className="downloadBtn"></button></a>
      </div>
    )
  }
}


export default PixDownload
