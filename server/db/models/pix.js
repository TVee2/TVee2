const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('pix', {
  size: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  img: {
    type: Sequelize.ARRAY(Sequelize.INTEGER),
    allowNull: false
  },
  palette: {
    type: Sequelize.INTEGER
  },
})
