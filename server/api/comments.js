const router = require('express').Router()
const {User, Vote, Comment} = require('../db/models')
module.exports = router

router
.get('/', (req, res, next) => {
  Comment.findAll({
    include: {model: User},
    order: [['createdAt', 'DESC']],
    limit: 50
  })
  .then((comments) => {
    res.status(200).json(comments)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.post('/', (req, res, next) => {
  var io = req.app.locals.io
  const user = req.user
  Comment.create(req.body)
  .then((comment) => User.findOne({where: {id: user.id}})
    .then((user) => comment.setUser(user))
    // .then(() => Comment.findAll({
    //   order: [['updatedAt', 'DESC']]
    // }))
  )
  .then((comment) => {
    Comment.findByPk(comment.id, {include:[{model:User}]})
    .then((comment)=>{
      io.emit('comment', comment)
      res.status(201).json(comment)
    })
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.delete('/:id', (req, res, next) => {
  Comment.findOne({
    where: {id: req.params.id}
  })
  .then((comment) => {
    if (comment) {
      return comment.destroy()
    } else {
      throw new Error('No comment found with matching id.')
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
  Vote.findOne({where: {pid, userId: req.user.id, comment_id: pid}})
  .then((vote) => {
    if (!vote) {
      return Vote.create({dir, pid, user_id: req.user.id, commentId: pid})
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
