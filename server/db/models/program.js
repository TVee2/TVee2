const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('program', {
  title:{
    type: Sequelize.STRING,
  },
  thumbnailUrl: {
    type: Sequelize.STRING,
  },
  duration:{
    type: Sequelize.STRING,
  },
  ytVideoId: {
    type: Sequelize.STRING,
  },
  width:{
    type: Sequelize.STRING,
  },
  height:{
    type: Sequelize.STRING,
  },
})
