const router = require('express').Router()
const {User, Channel} = require('../db/models')
module.exports = router

router
.get('/', (req, res, next) => {
  Channel.findAll({
    include: {model: User},
    order: [['createdAt', 'ASC']],
    limit: 50
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.get('/:id', (req, res, next) => {
  Channel.findOne({
    where: {id: req.params.id},
    include: {model: User},
  })
  .then((channels) => {
    res.status(200).json(channels)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.post('/', (req, res, next) => {
  const user = req.user
  Channel.create(req.body)
  .then((channel) => User.findOne({where: {id: user.id}})
    .then((user) => channel.setUser(user))
  )
  .then((channel) => {
    Channel.findByPk(channel.id, {include:[{model:User}]})
    .then((channel)=>{
      res.status(201).json(channel)
    })
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.delete('/:id', (req, res, next) => {
  Channel.findOne({
    where: {id: req.params.id}
  })
  .then((channel) => {
    if (channel) {
      return channel.destroy()
    } else {
      throw new Error('No channel found with matching id.')
    }
  })
  .then((channels) => {
    res.status(202).json(channels)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})
