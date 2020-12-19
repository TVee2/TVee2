import axios from 'axios'
import {FETCH_PIXS, FETCH_OWN_PIXS, SET_SELECTED_PIX, SET_SAVED_DRAFT, LOADING_PIXS} from '../constants'
import history from '../../../history'

import {updateSelectedRoom} from './room'
const io = require('socket.io-client')  
const socket = io() 

export const fetchPixs = pixs => ({
  type: FETCH_PIXS,
  pixs
})

export const fetchMyPixs = pixs => ({
  type: FETCH_OWN_PIXS,
  pixs
})

export const fetchOwnPix = (obj) => {
  return dispatch => {
    dispatch(fetchMyPixs(
      {list:{result:[], count:0, limit:0, page:1, pages:0}, isLoading:true}
    ))
    axios.get('/api/pix/user/'+obj.id+'/'+obj.page)
    .then(res=>res.data)
    .then((pixs)=>{
      dispatch(fetchMyPixs({list:pixs, isLoading:false}))
    })
  };
};

export const deletePix = (obj)=> {
  return dispatch => {
    axios.delete('/api/pix/'+obj.pixId)
    .then(res=>res.data)
    .then(()=>{
      dispatch(fetchRoomPixList(obj.roomId))
    })
  };
}

export const addPix = (pix) => {
  return dispatch => {
    axios.post('/api/pix', pix)
    .then(res=>res.data)
    .then((pix)=>{
      history.push('/pix')
    })
  };
};

export const saveReel = (arr) => {
  return dispatch => {
    axios.post('/api/reel', arr)
    .then(res=>res.data)
    .then((data)=>{
      // socket.emit('pix', pix);
      //if room does not match, switch room
      // dispatch(updateSelectedRoom(pix.roomId))
    })
    .then(()=>{
        history.push('/pix')
    })
  };
};


export const fetchPixList = (roomId) => {
  return dispatch => {
    // dispatch(fetchPixs({list:[], isLoading:true}))    
    axios.get('/api/pix', roomId)
    .then(res => res.data)
    .then(pixs =>{
      dispatch(fetchPixs({list:pixs, isLoading:false}))
    })
  }
}

export const fetchRoomPixList = (roomId) => {
  return dispatch => {
    if(!roomId){roomId=0}
    dispatch(startLoading(true))      
    axios.get('/api/pix/room/'+roomId)
    .then(res => res.data)
    .then(pixs =>{
      dispatch(startLoading(false))      
      dispatch(fetchPixs({list:pixs, isLoading:false}))
    })
    .catch((err)=>{
      dispatch(startLoading(false))      
      console.log(err)
    })
  }
}

export const likePix = (like) => {
  return dispatch => {
    axios.post('/api/pix/likes/'+like.pixId, like)
    .then(res => res.data)
    .then(pix =>{
      dispatch(fetchRoomPixList(like.roomId))
      dispatch(switchPix(pix))
    })
    .catch((err)=>{console.log(err)})
  }
}

export const unlikePix = (like) => {
  return dispatch => {
    axios.post('/api/pix/unlike/'+like.pixId, like)
    .then(res => res.data)
    .then(pix =>{
      dispatch(fetchRoomPixList(like.roomId))
      dispatch(switchPix(pix))
    })
    .catch((err)=>{console.log(err)})
  }
}

export const switchPix = selected => ({
  type: SET_SELECTED_PIX,
  selected
})

export const saveDraft = draft => {
  return({
    type: SET_SAVED_DRAFT,
    draft
  })
}

const initialState = {
  isLoadingList:false,
  pixList: {list:[], isLoading:false},
  ownList:{list:{result: [], count: 0, limit: 0, page: 1, pages: 0}, isLoading:false},
  selected: {},
  draft:{palette:null, img:[]}
}

export default function(state=initialState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case LOADING_PIXS:
      newState.isLoadingList = action.bool
      break;    
    case FETCH_OWN_PIXS:
      newState.ownList.isLoading = action.pixs.isLoading;
      newState.ownList.list = action.pixs.list;
      break;
    case FETCH_PIXS:
      newState.isLoadingList = false;
      newState.pixList = action.pixs;
      break;
    case SET_SELECTED_PIX:
      newState.selected = action.selected
      break;
    case SET_SAVED_DRAFT:
      newState.draft = action.draft
      break;  
    default:
      return state
  }
  return newState
}
