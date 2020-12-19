import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'
import self from './self'
import color from './color'
import pix from './pix'
import room from './room'
import post from './post'

const reducer = combineReducers({self, color, pix, room, post})
const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({collapsed: true}))
)
const store = createStore(reducer, middleware)

export default store
export * from './self'
export * from './color'
export * from './pix'
export * from './room'
export * from './post'
