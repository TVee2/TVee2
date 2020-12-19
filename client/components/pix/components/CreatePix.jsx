import React from 'react'
import { connect } from 'react-redux'
import Canvas from './Canvas'
import {setColor, setPalette, saveDraft} from '../store'
import Palette from './Palette'

var window_width = window.innerWidth

var tabData = [
  { name: '8X8 Pix', dim:8, symbol:"k", isActive: true },
  { name: '16X16 Pix', dim:16, symbol:"a", isActive: false },
];

// if(window_width>500){
//   tabData.push(  { name: '32X32 Pix', dim:32, symbol:"b", isActive: false })
// }

class Tabs extends React.Component {
  render() {
    return (
      <ul className="nav nav-tabs">
        {tabData.map((tab) => {
          return (
            <Tab key={tab.name} data={tab} isActive={this.props.activeTab === tab} handleClick={this.props.changeTab.bind(this, tab)} />
          )
        })}
      </ul>
    );
  }
}

class Tab extends React.Component {
  render() {
    console.log(this.props.isActive, this.props.data.name)
    return (
        <button style={{margin:"0 2px", backgroundColor:`${this.props.isActive?"papayawhip":"white"}`}} onClick={this.props.handleClick} className={`videobutton ${this.props.data.dim==8?"eight":"sixteen"}`}></button>
    );
  }
}


class CreatePix extends React.Component {
  constructor(props) {
    super(props)
    this.state = Object.assign({
      activeTab: tabData[0],
    })
  }

  getDrawStateAndSaveDraft = () => {
    var arr = []
    var dim = this.state.activeTab.dim
    var symbol = this.state.activeTab.symbol
    for(var i=0;i<dim;i++){
      for(var j=0;j<dim;j++){
        var elem = document.getElementById(symbol+i+"-"+j)
        if(elem){
          arr.push(elem.getAttribute('data-status'))
        }
      }
    }
    var palette = this.props.palette
    this.props.saveDraft({img: arr, palette:palette})
  }

  handleClick = (tab) => {
    this.getDrawStateAndSaveDraft()

    if(this.state.activeTab.name==='16X16 Pix'&&tab.name==='8X8 Pix'){
      if(window.confirm("Bigger pixels might mean some lost art! Proceed?")) {
        this.setState({activeTab: tab});
      }
    }else if(this.state.activeTab.name==='16X16 Pix'&&tab.name==='8X8 Pix'||this.state.activeTab.name==='32X32 Pix'&&tab.name==='16X16 Pix'||this.state.activeTab.name==='32X32 Pix'&&tab.name==='8X8 Pix'){
      if(window.confirm("You may lose pixel definition, proceed?")) {
        this.setState({activeTab: tab});
      }
    }else{
      this.setState({activeTab: tab});
    }
  }

  componentWillMount(){
    var draft = this.props.draft.img

    if(this.props.profPicMode && tabData.length===3){
      tabData.pop()
    }

    if(draft){
      if(draft.length===64){
        this.setState({activeTab:tabData[0]})

      }else if(draft.length===256){
        this.setState({activeTab:tabData[1]})

      }else if(draft.length===1024){
        this.setState({activeTab:tabData[2]})
      } 
    }
  }

  render(){
    var self = this.props.self;
    return (
      <div id="test" className="no-padding col-xs-12">
         {self?
         (
            <div id="touchArea" className="center-al col-xs-12">
              <Tabs activeTab={this.state.activeTab} changeTab={this.handleClick} />
               <div className="ok col-xs-12" id="pallcont2">
                 <Palette />
               </div>
               <Canvas match={this.props.match} editMode={this.props.editMode} profPicMode={this.props.profPicMode} getDrawStateAndSaveDraft = {this.getDrawStateAndSaveDraft} dim={this.state.activeTab.dim} symbol={this.state.activeTab.symbol}/> 
            </div>)
          :(<div className='col-sm-7'>
               <h3>Begin by logging in</h3>
            </div>)}
      </div>
    )
  }
}


const mapState = (state) => ({
  palette: state.color.selected.palette,
  draft:state.pix.draft,
  self:state.self
});

const mapDispatch = (dispatch) => {
  return {
    setColor(color){
      dispatch(setColor(color))
    },
    setPalette(paletteNo){
      dispatch(setPalette(paletteNo))
    },
    saveDraft(draft){
      dispatch(saveDraft(draft))
    },
  }
}

export default connect(mapState, mapDispatch)(CreatePix);
