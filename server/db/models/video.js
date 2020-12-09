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
  pathRetrievedAt:{
    type: Sequelize.BIGINT,
  },
  original:{
    type: Sequelize.BOOLEAN,
  },
  duration:{
    type: Sequelize.STRING,
  },
})
