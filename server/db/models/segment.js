const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('segment', {
  tkey: {
    //should include channel id + time
    primaryKey: true,
    type: Sequelize.STRING,
    allowNull: false,
    unique:true
  },
  time: {
    type: Sequelize.BIGINT,
  },
  progress:{
    type: Sequelize.INTEGER,
  },
})

