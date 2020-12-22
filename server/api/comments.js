const router = require('express').Router()
const {User, Vote, Comment, Post, Pix} = require('../db/models')
module.exports = router

router
.get('/', (req, res, next) => {
  //get all posts
  var channelId = req.query.channelId
  Post.findAll({
    include: [{model:User}, {model:Pix}, {model: Comment}],
    where:{channelId},
    order: [['createdAt', 'DESC']],
    limit: 50
  })

  // Comment.findAll({
  //   include: {model: User},
  //   where:{channelId},
  //   order: [['createdAt', 'DESC']],
  //   limit: 50
  // })
  .then((posts) => {
    res.status(200).json(posts)
  })
  .catch((err) => {
    res.status(400).json({error: err.message})
  })
})

.post('/', (req, res, next) => {
  //create post, create comment, associate
  var io = req.app.locals.io
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
    res.status(400).json({error: err.message})
  })
})

.post('/pix', (req, res, next) => {
  //create post, create pix, associate
  var io = req.app.locals.io
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
    res.status(400).json({error: err.message})
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
    res.status(400).json({error: err.message})
  })
})

// .post('/vote', (req, res, next) => {
//   const {dir, pid} = req.query
//   Vote.findOne({where: {pid, userId: req.user.id, comment_id: pid}})
//   .then((vote) => {
//     if (!vote) {
//       return Vote.create({dir, pid, user_id: req.user.id, commentId: pid})
//     } else {
//       vote.dir = dir
//       return vote.save()
//     }
//   })
//   .then(() => {
//     res.sendStatus(204)
//   })
//   .catch((err) => {
//     res.status(400).json(err)
//   })
// })
