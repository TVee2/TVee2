const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('timeslot', {
  starttime:{
    type: Sequelize.BIGINT,
  },
  endtime:{
    type: Sequelize.BIGINT,
  },
  recurring:{
    type: Sequelize.STRING
  }
})
