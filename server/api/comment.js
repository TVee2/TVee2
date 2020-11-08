const router = require('express').Router()
const {User, Vote} = require('../db/models')
module.exports = router

router
.get('/', (req, res, next) => {
  Comment.findAll({
    include: {model: Vote},
  })
  .then((comments) => {
    res.status(200).json(comments)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.post('/', (req, res, next) => {
  const user = req.user
  Comment.create(req.body)
  .then((protest) => User.findOne({where: {id: user.id}})
    .then((user) => protest.setUser(user))
    .then(() => Comment.findAll({
      order: [['updated_at', 'DESC']]
    }))
  )
  .then((comments) => {
    res.status(201).json(comments)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.delete('/:id', (req, res, next) => {
  Comment.findOne({
    where: {id: req.params.id}
  })
  .then((protest) => {
    if (protest) {
      return protest.destroy()
    } else {
      throw new Error('No protest found with matching id.')
    }
  })
  .then((comments) => {
    res.status(202).json(comments)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.post('/vote', (req, res, next) => {
  const {dir, pid} = req.query
  Vote.findOne({where: {pid, user_id: req.user.id, protest_id: pid}})
  .then((vote) => {
    if (!vote) {
      return Vote.create({dir, pid, user_id: req.user.id, protest_id: pid})
    } else {
      vote.dir = dir
      return vote.save()
    }
  })
  .then(() => {
    res.sendStatus(204)
  })
  .catch((err) => {
    res.status(400).json(err)
  })
})
