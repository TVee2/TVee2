const router = require('express').Router()
const {User, Vote, Comment, Post, Pix} = require('../db/models')

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

.get('/all', (req, res, next)=>{
  Post.findAll({
    order: [['createdAt', 'DESC']],
  })
  .then((items)=>{
    res.status(200).json(items)
  })
})


.post('/', (req, res, next) => {
  const user = req.user
  Comment.create(req.body)
  .then((comment)=>{
    return Post.create({userId:req.user.id, commentId:comment.id, channelId:req.body.channelId})
  })
  .then((post) => {
    Post.findByPk(post.id, {include:[{model:User, include:[{model:Pix, as:"profilePix"}]}, {model:Pix}, {model: Comment}]})
    .then((post)=>{
      var io = req.app.locals.io
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
        var io = req.app.locals.io
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
    if(!req.user.admin && post.userId != req.user.id){
      throw new Error("forbidden")
    }
    if (post) {
      return post.destroy()
    } else {
      throw new Error('No post found with matching id.')
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
