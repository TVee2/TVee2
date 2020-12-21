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
      return
    }
    return (
      <div>
        {this.state.pixList.map((pix)=>{
          return <PixBlock onClick={this.props.selectPixHandler} pix={pix} dim={32}/>
        })}
      </div>
    )
  }
}
