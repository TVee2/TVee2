const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('playlist', {
  title:{
    type: Sequelize.STRING,
  },
  description:{
    type: Sequelize.TEXT,
  },
  thumbnailUrl:{
    type: Sequelize.STRING,   
  },
  isYoutubePlaylist:{
    type: Sequelize.BOOLEAN,
  }
})
