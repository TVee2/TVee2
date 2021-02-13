import {createStore, combineReducers, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import {composeWithDevTools} from 'redux-devtools-extension'
import user from './user'

const reducer = combineReducers({user})

var mid = []
mid.push(thunkMiddleware)
if(NODE_ENV=='development'){
  mid.push(createLogger({collapsed: true}))
}

const middleware = composeWithDevTools(
  applyMiddleware(...mid)
)
const store = createStore(reducer, middleware)

export default store
export * from './user'
