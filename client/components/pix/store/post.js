import axios from 'axios'
import {FETCH_POSTS, FETCH_OWN_POSTS, SET_SELECTED_POST, SET_SAVED_DRAFT, LOADING_POSTS} from '../constants'
import history from '../../../history'

import {updateSelectedRoom} from './room'
const io = require('socket.io-client')  
const socket = io() 

export const fetchPosts = posts => ({
  type: FETCH_POSTS,
  posts
})

export const fetchMyPosts = posts => ({
  type: FETCH_OWN_POSTS,
  posts
})

export const startLoading = bool => ({
  type: LOADING_POSTS,
  bool
})

export const fetchOwnPost = (obj) => {
  return dispatch => {
    dispatch(fetchMyPosts(
      {list:{result:[], count:0, limit:0, page:1, pages:0}, isLoading:true}
    ))
    axios.get('/api/posts/user/'+obj.id+'/'+obj.page)
    .then(res=>res.data)
    .then((posts)=>{
      dispatch(fetchMyPosts({list:posts,isLoading:false}))
    })
  };
};

export const deletePost = (obj)=> {
  return dispatch => {
    axios.delete('/api/posts/'+obj.postId)
    .then(res=>res.data)
    .then(()=>{
      socket.emit('post', obj);
      dispatch(fetchRoomPostList(obj.roomId))
    })
  };
}


export const addPost = (post) => {
  return dispatch => {
    axios.post('/api/posts', post)
    .then(res=>res.data)
    .then((posts)=>{
      socket.emit('post', post);
      //if room does not match, switch room
      dispatch(updateSelectedRoom(post.roomId))
    })
    .then(()=>{
        history.push('/post')
    })
  };
};

export const addPostPix = (pix) => {
  return dispatch => {
    axios.post('/api/posts/pix', pix)
    .then(res=>res.data)
    .then((post)=>{
      history.push(`/room/${post.roomId}`)
    })
  };
};

export const editPostPix = (pix) => {
  return dispatch => {
    axios.put(`/api/posts/pix/${pix.id}`, pix)
    .then(res=>res.data)
    .then((posts)=>{
      history.push('/mypix')
    })
  };
};

export const saveReel = (arr) => {
  return dispatch => {
    axios.post('/api/reel', arr)
    .then(res=>res.data)
    .then((data)=>{
      // socket.emit('post', post);
      //if room does not match, switch room
      // dispatch(updateSelectedRoom(post.roomId))
    })
    .then(()=>{
        history.push('/post')
    })
  };
};


export const fetchPostList = (roomId) => {
  return dispatch => {
    // dispatch(fetchPosts({list:[], isLoading:true}))    
    axios.get('/api/posts', roomId)
    .then(res => res.data)
    .then(posts =>{
      dispatch(fetchPosts({list:posts, isLoading:false}))
    })
  }
}

export const fetchRoomPostList = (roomId) => {
  return dispatch => {
    if(!roomId){roomId=1}
    dispatch(startLoading(true))      
    axios.get('/api/posts/room/'+roomId)
    .then(res => res.data)
    .then(posts =>{
      dispatch(startLoading(false))      
      dispatch(fetchPosts({list:posts, isLoading:false}))
    })
    .catch((err)=>{
      dispatch(startLoading(false))      
      console.log(err)
    })
  }
}

export const likePost = (like) => {
  return dispatch => {
    axios.post('/api/posts/likes/'+like.postId, like)
    .then(res => res.data)
    .then(post =>{
      dispatch(fetchRoomPostList(like.roomId))
      dispatch(switchPost(post))
    })
    .catch((err)=>{console.log(err)})
  }
}

export const unlikePost = (like) => {
  return dispatch => {
    axios.post('/api/posts/unlike/'+like.postId, like)
    .then(res => res.data)
    .then(post =>{
      dispatch(fetchRoomPostList(like.roomId))
      dispatch(switchPost(post))
    })
    .catch((err)=>{console.log(err)})
  }
}

export const switchPost = selected => ({
  type: SET_SELECTED_POST,
  selected
})

const initialState = {
  isLoadingList:false,
  postList: {list:[], isLoading:false},
  ownList:{list:{result: [], count: 0, limit: 0, page: 1, pages: 0}, isLoading:false},
  selected: {},
  draft:[]
}

export default function(state=initialState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case LOADING_POSTS:
      newState.isLoadingList = action.bool
      break;    
    case FETCH_OWN_POSTS:
      newState.ownList.isLoading = action.posts.isLoading;
      newState.ownList.list = action.posts.list;
      break;
    case FETCH_POSTS:
      newState.isLoadingList = false;
      newState.postList = action.posts;
      break;
    case SET_SELECTED_POST:
      newState.selected = action.selected
      break;
    default:
      return state
  }
  return newState
}
