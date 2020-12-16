const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('playlistItem', {
  position:{
    type: Sequelize.INTEGER,
  },
  title:{
    type: Sequelize.STRING,
  },
  thumbnailUrl: {
    type: Sequelize.STRING,
  },
  duration:{
    type: Sequelize.STRING,
  },
  ytVideoId:{
    type: Sequelize.STRING,   
  },
  embeddable:{
    type: Sequelize.BOOLEAN,  
  },
  playableVideo:{
    type: Sequelize.BOOLEAN,
  },
  width:{
    type: Sequelize.STRING,
  },
  height:{
    type: Sequelize.STRING,
  },
})
