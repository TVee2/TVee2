const router = require('express').Router()
const {User, Pix} = require('../db/models')
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

.post('/profilePix', async (req, res, next) => {
  try {
    var pix = await Pix.findByPk(req.body.id)
    await req.user.setProfilePix(pix)
    res.json(pix)
  } catch (err) {
    next(err)
  }
})