const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('video', {
  quality:{
    type: Sequelize.STRING, 
  },
  path:{
    type: Sequelize.STRING,
  },
  original:{
    type: Sequelize.BOOLEAN,    
  },
  duration:{
    type: Sequelize.STRING,
  },
})
