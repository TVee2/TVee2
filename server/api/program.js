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

.get('/all', (req, res, next)=>{
  Program.findAll({
    order: [['createdAt', 'DESC']],
  })
  .then((items)=>{
    res.status(200).json(items)
  })
})

.delete('/:id', (req, res, next) => {
  Program.findOne({
    where: {id: req.params.id}
  })
  .then((program) => {
    if(!req.user.admin && program.userId != req.user.id){
      throw new Error("forbidden")
    }
    if (program) {
      return program.destroy()
    } else {
      throw new Error('No program found with matching id.')
    }
  })
  .then((ret) => {
    res.status(200).json(ret)
    return
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})
