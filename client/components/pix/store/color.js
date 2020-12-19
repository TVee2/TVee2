import axios from 'axios'
import {SET_CURRENT_COLOR, SET_CURRENT_PALETTE} from '../constants'

export const colorIs = color => ({
  type: SET_CURRENT_COLOR,
  color
})

export const paletteIs = palette => ({
  type: SET_CURRENT_PALETTE,
  palette
})


export const setColor = (colorClass) => {
  return dispatch => {
    dispatch(colorIs(colorClass))
  };
};

export const setPalette = (paletteNo) => {
  return dispatch => {
    dispatch(paletteIs(paletteNo))
  };
};

export const getColor = (color) => {
  return dispatch => {
    dispatch(colorIs(color))
  };
};


const initialState = {  
  selected: {color:{id:null, class:null}, palette:null},
}

export default function(state=initialState, action) {
  const newState = Object.assign({}, state)

  switch (action.type) {
    case SET_CURRENT_PALETTE:

      newState.selected.palette = action.palette
      break;
    case SET_CURRENT_COLOR:

      newState.selected.color = action.color
      break;
    default:
      return state
  }

  return newState
}



