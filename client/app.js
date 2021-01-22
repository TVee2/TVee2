import React from 'react'
import {Navbar} from './components'
import Routes from './routes'

const App = () => {
  return (
    <div>
      <Navbar />
      <div style={{height:"72px"}}></div>
      <Routes />
    </div>
  )
}

export default App
