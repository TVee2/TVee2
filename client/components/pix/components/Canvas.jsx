import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {addPostPix, editPostPix, setProfilePix, setPalette} from '../store'

class Canvas extends React.Component {
  constructor(props) {
    super(props)

    this.state={}

    this.mouseDown=false;
    this.onResetHandler=this.onResetHandler.bind(this);
    this.createPixHoverHandler=this.createPixHoverHandler.bind(this);
    this.createPixClickHandler=this.createPixClickHandler.bind(this);
    this.touch2Mouse=this.touch2Mouse.bind(this);
    this.dataToClasses = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p"];
    this.loadDraft = this.loadDraft.bind(this)
  }

  componentDidMount(){
    var toucharea=document.getElementById("touchArea")
    toucharea.addEventListener("touchstart", this.touch2Mouse, true);
    toucharea.addEventListener("touchmove", this.touch2Mouse, true);
    var dim = this.props.dim
    var img = this.props.draft.img
    var palette = this.props.draft.palette

    if(img.length === Math.pow(dim, 2)){
      this.loadDraft(img, palette, dim)
    }
    if(this.props.editMode || this.props.profPicMode){
      this.props.setPalette(this.props.palette)
    }
  }

  reduceDef(arr){
    var row = Math.sqrt(arr.length)
    var newArr = []
    while(arr.length){
      for(var i=0;i<row/2;i++){
        newArr.push(arr[0])
        arr.shift()
        arr.shift()
      }
      arr=arr.slice(row)
    }
    return newArr
  }

  increaseDef(arr){
    var row = Math.sqrt(arr.length)
    var newArr = []
    while(arr.length){
      for(var i=0;i<row;i++){
        newArr.push(arr[i])
        newArr.push(arr[i])
      }
      for(var i=0;i<row;i++){
        newArr.push(arr[i])
        newArr.push(arr[i])
      }
      arr=arr.slice(row)
    }
    return newArr
  }

  loadDraft(arr, palette){
    if(!arr.length){
      return
    }
    if(!palette){
      palette=0
    }
    var size = Math.sqrt(arr.length)
    for(var i=0;i<size;i++){
      for(var j=0;j<size;j++){
        var num = j+size*i;
        var elem = document.getElementById(this.props.symbol+i+"-"+j)
        elem.setAttribute('class', `${this.dataToClasses[palette]+this.dataToClasses[arr[num]]}`)
        elem.setAttribute('data-status', arr[num])
      }
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.editMode!==this.props.editMode || prevProps.profPicMode!==this.props.profPicMode){
      this.clearBoard()
    }

    if(prevProps.dim!==this.props.dim){
      var draft = this.props.draft.img
      var dim = this.props.dim
      if(!draft.length){
        return
      }
      while(draft.length!==Math.pow(dim, 2)){
        if(Math.pow(dim, 2)<draft.length){
          draft = this.reduceDef(draft)
        }else if(Math.pow(dim, 2)>draft.length){
          draft = this.increaseDef(draft)
        }
      }
      this.loadDraft(draft, this.props.draft.palette, dim)
    }
  }

  clearBoard= ()=>{
    for(var i=0;i<this.props.dim;i++){
      for(var j=0;j<this.props.dim;j++){
        var elem = document.getElementById(this.props.symbol+i+"-"+j)
        elem.setAttribute('class', `${this.dataToClasses[this.props.palette||0]+'a'}`)
        elem.setAttribute('data-status', 0)
      }
    }
  }

  componentWillUnmount(){
    if(!this.props.editMode && !this.props.profPicMode){
      this.props.getDrawStateAndSaveDraft()
    }else{
      this.clearBoard()
      this.props.setPalette(0)
      this.props.getDrawStateAndSaveDraft()
    }
  }

  touch2Mouse(evt){
    var theTouch = evt.changedTouches[0];
    var mouseEv;
    switch(evt.type)
    {
      case "touchstart": mouseEv="mousedown"; break;  
      case "touchmove":  mouseEv="mouseover"; break;
      default: return;
    }

    var elem = document.elementFromPoint(theTouch.clientX, theTouch.clientY)
    if(elem.id.slice(0, 1)===this.props.symbol&&(elem.id.length>=4||elem.id.length<=6)){
      if(this.props.color.class!==elem.getAttribute('class')){
        elem.setAttribute('class', `${this.props.color.class}`)
        elem.setAttribute('data-status', this.props.color.id) 
      } 
    }else if(mouseEv==="mousedown"){
      elem.click();
    }

    evt.preventDefault()
  }

  onResetHandler(evt){
    if (window.confirm("Do you really want to reset?  You will lose all of your work.")) { 
      this.clearBoard()
    }
  }

  onSubmitHandler = (evt) => {
    var arr = []
    for(var i=0;i<this.props.dim;i++){
      for(var j=0;j<this.props.dim;j++){
        var elem1 = document.getElementById(this.props.symbol+i+"-"+j)
        arr.push(elem1.getAttribute('data-status'))
      }
    }

    if(this.props.self){
       if(this.props.editMode){
         this.props.editPostPix({id:this.props.match.params.id, img:arr, size:this.props.dim, palette: this.props.palette||0, userId:this.props.self.id})
       }else if(this.props.profPicMode){
         this.props.setProfilePix({img:arr, size:this.props.dim, palette: this.props.palette||0, userId:this.props.self.id})
       }else{
         this.props.addPostPix({img:arr, size:this.props.dim, palette: this.props.palette||0, userId:this.props.self.id, roomId:this.props.room.selectedRoom.id})
       }

      for(var i=0;i<this.props.dim;i++){
        for(var j=0;j<this.props.dim;j++){
          var elem2 = document.getElementById(this.props.symbol+i+"-"+j)
          elem2.setAttribute('class', 'a')
          elem2.setAttribute('data-status', 0)
        }
      }
      this.props.setPalette(0)
      var sub = document.getElementById("submit")

      sub.disabled=true;
      sub.style.backgroundColor='gray';

      var create = document.getElementById("create")
      var p = document.createElement("p")
      p.innerHTML="Submitting your pix..."
      create.appendChild(p)
      this.props.handleChatClick()
    }
  }

  createPixHoverHandler(evt){
    
    evt.preventDefault()
    if(document.mouseDown){
      evt.target.setAttribute('class', `${this.props.color.class}`)
      evt.target.setAttribute('data-status', this.props.color.id) 
    }
   }

  createPixClickHandler(evt){
    evt.preventDefault()
    var elem = evt.target

    if(this.props.color.class!==evt.target.getAttribute('class')){
      evt.target.setAttribute('class', `${this.props.color.class}`)
      evt.target.setAttribute('data-status', this.props.color.id) 
    }else{
      evt.target.setAttribute('class', `${this.dataToClasses[this.props.palette||0]+'a'}`)
      evt.target.setAttribute('data-status', 0)
    }
   }

  render(){
   const hh=this.createPixHoverHandler;
   const ch=this.createPixClickHandler;

   document.body.onmousedown = function(evt){
     document.mouseDown=true;
   }

   document.body.onmouseup = function(evt){
     document.mouseDown=false;
   }
   var init = this.dataToClasses[this.props.palette||0]+'a'
   var btn_text = "Submit"
   if(this.props.editMode){
    btn_text="Update Pix"
   }else if(this.props.profPicMode){
    btn_text="Update Profile"
   }

   return (
     <div id = "create">
       <br/>
       <table id={`${this.props.symbol}create`} className="table">
         <tbody>
           {[...Array(this.props.dim)].map((x,i) => {
             var num = i*this.props.dim;
             return (<tr className="canvascreate" key={`${this.props.symbol}arow+${i}`} id={`row+${i}`}>
                   {[...Array(this.props.dim)].map((y,j) => {
                     return (<td data-status={'0'} className={`${init}`} key={`${this.props.symbol}${i}-${j}`} id={`${this.props.symbol}${i}-${j}`} onMouseOver={hh} onMouseDown={ch}></td>)
                 })}
                 </tr>)
             }
           )}
         </tbody>
       </table>
       <br/>
       <br/>
       <div className="center">
         <button id="reset" className="btn btn-submit btn-block" onClick={this.onResetHandler}>Reset</button>
         <div className="spacer"></div>
         <button id="submit" className="btn btn-submit btn-block" onClick={this.onSubmitHandler}>{btn_text}</button>
       </div>
     </div>
   )
  }
}


const mapState = (state) => ({
  pix: state.pix,
  color: state.color.selected.color,
  palette: state.color.selected.palette,
  room: state.room,
  draft: state.pix.draft,
  self: state.self
});

const mapDispatch = (dispatch) => {
  return {
    addPostPix(post){
      dispatch(addPostPix(post))
    },
    setPalette(paletteNo){
      dispatch(setPalette(paletteNo))
    },
    setProfilePix(pix){
      dispatch(setProfilePix(pix))
    },
    editPostPix(post){
      dispatch(editPostPix(post))
    },
  }
}


export default connect(mapState, mapDispatch)(Canvas);
