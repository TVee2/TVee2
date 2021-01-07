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
  youtubeId: {
    type: Sequelize.STRING,
  },
  width:{
    type: Sequelize.STRING,
  },
  height:{
    type: Sequelize.STRING,
  },
  color:{
    type:Sequelize.STRING,
    defaultValue: ()=>{
      const d = 185
      const a = Math.ceil(Math.random() * 80 + d)
      const b = Math.ceil(Math.random() * 80 + d)
      const c = Math.ceil(Math.random() * 80 + d)
      const color = `rgb(${a},${b},${c})`
      return color
    }
  }
})
