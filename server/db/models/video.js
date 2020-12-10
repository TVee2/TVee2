const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('video', {
  quality:{
    type: Sequelize.STRING,
  },
  path:{
    type: Sequelize.STRING(1000),
  },
  awsKey: {
    type: Sequelize.STRING,
  },
  awsPathRetrievedAt:{
    type: Sequelize.BIGINT,
  },
  youtubeId: {
    type: Sequelize.STRING,
  },
  thumbnailUrl:{
    type: Sequelize.STRING,
  },
  duration:{
    type: Sequelize.STRING,
  },
})
