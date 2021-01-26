import React, {Component} from 'react'
import axios from 'axios'
import PixBlock from './pix/components/PixBlock'
export default class Generic extends Component {
  constructor() {
    super()

    this.state = {
      pixList:[],
      page: 1,
    }
  }

  componentDidMount() {
    this.getPix()
  }

  getPix = () => {
    axios.get(`/api/pix/icons`)
    .then((ret) => {
      this.setState({pixList:ret.data.result})
    })
  }

  pixClickHandler = (pix)=>{
    console.log(pix)
  }

  render() {
    if(!this.state.pixList){
      return (<div>Create some pix and they will show up down here!</div>)
    }
    return (
      <div>
        {this.state.pixList.map((pix)=>{
          return (<div style={{display:"inline-block", margin:"2px 2px"}}>
            <PixBlock onClick={this.props.selectPixHandler.bind(this, pix)} pix={pix} dim={this.props.dim?this.props.dim:32}/>
          </div>)
        })}
      </div>
    )
  }
}
