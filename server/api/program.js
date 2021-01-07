const router = require('express').Router()
const {Program} = require('../db/models')
const {uploadProgram} = require('./crudHelpers')

module.exports = router

router.post('/youtubelink', async (req, res) => {
  var youtubeId = req.body.youtubeId
  try{
    var program = await uploadProgramyoutubeId
    res.json(program)
  }catch(err){
    res.json(err)
  }
})

router.get('/', (req, res) => {
  Program.findAll({where:{userId: req.user.id}})
  .then((programs)=>{
    res.json(programs)
  })
})
