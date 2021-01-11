const router = require('express').Router()
const User = require('../db/models/user')
const Pix = require('../db/models/pix')

module.exports = router

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({where: {email: req.body.email}})
    if (!user) {
      console.log('No such user found:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else if (!user.correctPassword(req.body.password)) {
      console.log('Incorrect password for user:', req.body.email)
      res.status(401).send('Wrong username and/or password')
    } else {
      req.login(user, err => (err ? next(err) : res.json(user)))
    }
  } catch (err) {
    next(err)
  }
})

router.post('/signup', async (req, res, next) => {
  var randColor = ()=>{
    const d = 185
    const a = Math.ceil(Math.random() * 80 + d)
    const b = Math.ceil(Math.random() * 80 + d)
    const c = Math.ceil(Math.random() * 80 + d)
    const color = `rgb(${a},${b},${c})`
    return color
  }
  var color = randColor()
  req.body.color = color
  console.log(req.body)
  try {
    const user = await User.create(req.body)
    req.login(user, err => (err ? next(err) : res.json(user)))
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      res.status(401).send('User already exists')
    } else {
      next(err)
    }
  }
})

router.post('/logout', (req, res) => {
  req.logout()
  req.session.destroy()
  res.redirect('/')
})

router.get('/me', (req, res) => {
  res.json(req.user)
})

router.get('/me/detailed', (req, res) => {
  var user = req.user
  if(req.user){
    return User.findByPk(user.id, {include: [{model:Pix, as:"profilePix"}]})
    .then((user)=>{
      return res.json(user)
    })
    .catch((err)=>{console.log(err)})
  }else{
    return res.json(user)
  }
})

router.use('/google', require('./google'))
