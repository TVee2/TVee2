import React, {Component} from 'react'
import axios from 'axios'
import PixBlock from './pix/components/PixBlock'
export default class Generic extends Component {
  constructor() {
    super()

    this.state = {
      pixList:[],
      page: 1,
      debounce:false,
    }
  }

  componentDidMount() {
    this.getPix()
  }

  getPix = () => {
    this.setState({debounce:true})
    axios.get(`/api/pix/icons`)
    .then((ret) => {
      this.setState({pixList:ret.data.result, debounce:false})
    })
  }

  render() {
    if(!this.state.pixList){
      return (<div>Create some pix and they will show up down here!</div>)
    }
    return (
      <div>
        {
          this.state.pixList.length?this.state.pixList.map((pix)=>{
          return (<div style={{display:"inline-block", margin:"2px 2px", cursor:"pointer"}}>
            <PixBlock onClick={this.props.selectPixHandler.bind(this, pix)} pix={pix} dim={this.props.dim?this.props.dim:32}/>
          </div>)
          }):(this.state.debounce?<div>Getting Pix...</div>:<div>There doesn't appear to be anything here. Try creating something!</div>)
      }
      </div>
    )
  }
}
