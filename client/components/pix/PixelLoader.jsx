import React, { Component } from 'react';


class PixelLoader extends Component {
  constructor() {
    super();
    this.state = { boxes:[] };

    this.genHex=this.genHex.bind(this)
    this.genGroup=this.genGroup.bind(this)
  }

  componentDidMount() {
    this.setState({boxes:this.genGroup()}, () => {
      this.count=setInterval(() => {
        const arr = this.genGroup()
        return this.state.boxes.length<300?this.setState({boxes:this.state.boxes.concat(this.genGroup())})
          :this.setState({boxes:[]})
      }, 25)
    })
  }

  componentWillUnmount(){
    clearInterval(this.count)
  }

  genGroup(){
    let arr = [];
    for(var i=0;i<1;i++){
      let item = this.genHex()
      arr.push(item)
    }
    return arr
  }

  genHex(){
    const color = '#'+Math.floor(Math.random()*16777215).toString(16);
    return {color:color}
  }

  render() {

    return (
      <div>
        {this.state.boxes.map((box, i) => {
          return <div key={i} className="loadingBox" style={{backgroundColor:box.color}}/>
        })}
      </div>
    );
  }
}

export default PixelLoader;
