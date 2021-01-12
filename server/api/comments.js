const router = require('express').Router()
const {User, Vote, Comment, Post, Pix} = require('../db/models')
const io = require('../socket/index.js').io

module.exports = router

router
.get('/', (req, res, next) => {
  var channelId = req.query.channelId
  Post.findAll({
    include: [{model:User, include:[{model:Pix, as:"profilePix"}]}, {model:Pix}, {model: Comment}],
    where:{channelId},
    order: [['createdAt', 'DESC']],
    limit: 20
  })
  .then((posts) => {
    res.status(200).json(posts)
  })
  .catch((err) => {
    console.log(err)
    res.status(500).json(err);
  })
})

.post('/', (req, res, next) => {
  const user = req.user
  Comment.create(req.body)
  .then((comment)=>{
    return Post.create({userId:req.user.id, commentId:comment.id, channelId:req.body.channelId})
  })
  .then((post) => {
    Post.findByPk(post.id, {include:[{model:User}, {model:Pix}, {model: Comment}]})
    .then((post)=>{
      io.emit(`c${post.channelId}`, post)
      res.status(201).json(post)
    })
  })
  .catch((err) => {
    res.status(500).json(err);
  })
})

.post('/pix', (req, res, next) => {
  const user = req.user
  Pix.findOne({where:{id:req.body.pix.id}})
  .then((pix) => {
    Post.create({pixId:req.body.pix.id, userId:req.user.id, channelId:req.body.channelId})
    .then((post)=>{
      Post.findByPk(post.id, {include:[{model:User}, {model:Pix}, {model: Comment}]})
      .then((post)=>{
        io.emit(`c${post.channelId}`, post)
        res.status(201).json(post)
      })
    })
  })
  .catch((err) => {
    res.status(500).json(err);
  })
})

.delete('/:id', (req, res, next) => {
  Post.findOne({
    where: {id: req.params.id}
  })
  .then((post) => {
    if (post) {
      return post.destroy()
    } else {
      throw new Error('No comment found with matching id.')
    }
  })
  .then((comments) => {
    res.status(202).json(comments)
  })
  .catch((err) => {
    res.status(500).json(err);
  })
})
