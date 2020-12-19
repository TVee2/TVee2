import axios from 'axios'
import {FETCH_ROOMS, SET_CURRENT_ROOM, FETCH_OWN_ROOMS, ROOM_SIGNIN_ERROR} from '../constants'

import history from '../../../history'
import { fetchRoomPixList } from './pix'
import {me} from './self' 
const io = require('socket.io-client')  
const socket = io() 

export const fetchRooms = rooms => ({
  type: FETCH_ROOMS,
  rooms
})

export const fetchOwnRooms = rooms => ({
  type: FETCH_OWN_ROOMS,
  rooms
})

export const setRoom = room => ({
  type: SET_CURRENT_ROOM,
  room
})

export const superSetRoom = room => {
  return dispatch => {
    if(!room || !room.id){
      socket.off()
      room = {}
      history.push('/earth')
    }else{
      socket.off()
      socket.emit('room', room);
      socket.on('pix', (pix)=> {
        if(pix.roomId===room.id){
          dispatch(fetchRoomPixList(room.id))
        }
      })

      history.push(`/room/${room.id}`)
    }

    dispatch(setRoom(room))
  }
}


export const roomSigninError = err => ({
  type: ROOM_SIGNIN_ERROR,
  err
})

export const signInToRoom = roomname => {
  return dispatch => {
    axios.get('/api/rooms/signin?roomname='+roomname)
    .then((room)=>{
      if(!room.data.error){
        dispatch(superSetRoom(room.data))
        history.push('/studentlogin')
      }else{
        dispatch(roomSigninError(room.data))
      }
    })
  }
}

export const setDefaultRoom = obj => {
  return dispatch => {
    axios.put('/api/rooms/default/'+obj.roomId)
    .then(res => {
        return res.data
    })
    .then(rooms => {
      //refresh eager loaded room association on self user
      dispatch(me())
    })
    .catch(console.error.bind(console))
  }
}

export const getRooms = room => {
  return dispatch => {
    axios.get('/api/rooms/')
    .then(res => {
        return res.data
    })
    .then(rooms => {
      dispatch(fetchRooms(rooms))
    })
    .catch(console.error.bind(console))
  }
}

export const getOwnRooms = id => {
  return dispatch => {
    axios.get('/api/rooms/self')
    .then(res => {
        return res.data
    })
    .then(rooms => {
      dispatch(fetchOwnRooms(rooms))
    })
    .catch(console.error.bind(console))
  }
}

export const getAllRooms = id => {
  return dispatch => {
    axios.get('/api/rooms')
    .then(res => {
        return res.data
    })
    .then(rooms => {
      dispatch(fetchRooms(rooms))
    })
    .catch(console.error.bind(console))
  }
}

export const updateSelectedRoom = id => {
  return dispatch => {
    axios.get('/api/rooms/'+id)
    .then(res => {
        return res.data
    })
    .then(room => {
      dispatch(superSetRoom(room))
    })
    .catch(console.error.bind(console))
  }
}

export const addNewRoom = room => {
  return dispatch => {
    axios.post('/api/rooms/', room)
    .then(res => {
        return res.data
    })
    .then(room => {
      dispatch(superSetRoom(room))
      dispatch(setDefaultRoom({ roomId: room.id }))
    })
    .catch(console.error.bind(console))
  }
}

const initialState = {
  selectedRoom: {},
  ownRoomList:[],
  roomList: [], 
  error: {},
}

export default function(state=initialState, action) {
  const newState = Object.assign({}, state)

  switch (action.type) {
    case FETCH_ROOMS:
      newState.roomList = action.rooms
      break;
    case FETCH_OWN_ROOMS:
      newState.ownRoomList = action.rooms
      break;      
    case SET_CURRENT_ROOM:
      newState.selectedRoom = action.room
      break;
    case ROOM_SIGNIN_ERROR:
      newState.error = action.err
      break;    
    default:
      return state
  }

  return newState
}

