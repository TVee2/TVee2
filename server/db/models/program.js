const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('program', {
  title:{
    type: Sequelize.STRING,
  },
  duration:{
    type: Sequelize.STRING,
  },
  ad:{
    type: Sequelize.BOOLEAN,
    allowNull:false
  }
})