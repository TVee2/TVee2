const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('channel', {
  name:{
    type: Sequelize.STRING,
    unique: true,
  },
  description:{
    type: Sequelize.TEXT,
  },
  thumbnailUrl: {
    type: Sequelize.TEXT,   
  },
  active: {
    type: Sequelize.BOOLEAN,   
    defaultValue:true
  }
})
