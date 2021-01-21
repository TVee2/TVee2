const router = require('express').Router()
const {User, Channel, Pix} = require('../db/models')
const {needsSuperAdmin, needsAdmin, needsloggedIn} = require('./middlewareValidation')

module.exports = router

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email']
    })
    res.json(users)
  } catch (err) {
    next(err)
  }
})

.get('/all', (req, res, next)=>{
  User.findAll({
    order: [['createdAt', 'DESC']],
  })
  .then((items)=>{
    res.status(200).json(items)
  })
})

.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {include: [{model:Channel}, {model:Pix, as:'profilePix'}, {model:Pix, as:'creations'}]})
    res.json(user)
  } catch (err) {
    next(err)
  }
})


.post('/profilePix', async (req, res, next) => {
  try {
    var pix = await Pix.findByPk(req.body.id)
    await req.user.setProfilePix(pix)
    res.json(pix)
  } catch (err) {
    next(err)
  }
})

.put('/lock/:id', needsAdmin, async (req, res, next) => {
  User.findByPk(req.params.id)
  .then((user) => {
      user.locked = true
      user.save()
  })
})

.put('/unlock/:id', needsAdmin, async (req, res, next) => {
  User.findByPk(req.params.id)
  .then((user) => {
      user.locked = false
      user.save()
  })
})

.put('/elevate/:id', needsSuperAdmin, async (req, res, next) => {
  if(!req.user.superAdmin){
    return res.json({message:"operation disallowed"})
  }else{
    User.findByPk(req.params.id)
    .then((user) => {
      user.admin = true
      user.save()
    })
  }
})

.put('/demote/:id', needsSuperAdmin, async (req, res, next) => {
  if(!req.user.superAdmin){
    return res.json({message:"operation disallowed"})
  }else{
    User.findByPk(req.params.id)
    .then((user) => {
      user.admin = false
      user.save()
    })
  }
})

.delete('/:id', needsSuperAdmin, (req, res, next) => {
  User.findOne({
    where: {id: req.params.id}
  })
  .then((user) => {
    if(!req.user.superAdmin || user.id != req.user.id){
      throw new Error("forbidden")
    }
    if (user) {
      return user.destroy()
    } else {
      throw new Error('No user found with matching id.')
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
