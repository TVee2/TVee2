// const {
//   User, 
//   Pix
// } = require('../db/models')

// const { Op } = require("sequelize");

// module.exports = require('express')
//   .Router()

//   .get('/', (req, res, next) => {
//     Pix.findAll({
//       order: [['createdAt', 'DESC']],
//       limit: 10,
//       include: [
//         {model: Pix, include: {model: User}},
//         {model: User, as: 'creator'},
//       ],
//     })
//     .then((pix)=>{
//       return res.status(200).json(pix)
//     })
//     .catch(err => {
//       console.log(err)
//     })
//   })

//   .get('/:id', (req, res, next) => {
//     Pix.findByPk(req.params.id)
//     .then((pix)=>{
//       return res.status(200).json(pix)
//     })
//     .catch(err => {
//       console.log(err)
//     })
//   })

//   .get('/user/:id/:page', (req, res, next) => {
//     let limit = 7
//     let page = req.params.page
//     let offset = 7 * (page - 1)
//     Pix.findAndCountAll({
//       where: {creatorId: req.params.id},
//       order: [['id', 'DESC']],
//       limit: limit,
//       offset: offset,
//       include: [
//         {model: Pix, include: {model: User}},
//         {model: User, as: 'creator', include: {model:Post, as:"profilePicture", include:{model:Pix}}},
//       ]
//     }).then(pixs => {
//       let count = pixs.count
//       let pages = Math.ceil(count / limit)
//       return res.status(200).json({
//         result: pixs,
//         count: count,
//         page: Number(req.params.page),
//         pages: pages
//       })
//     })
//     .catch(err => {
//       console.log(err)
//       res.status(500).send('Internal Server Error')
//     })
//   })

//   .post('/pix', (req, res, next) => {
//     var myArray = req.body.img
//     var flag = 0

//     req.body.priority = Date.parse(new Date()) / 1000

//     for (i = 0; i < myArray.length; ++i) {
//       if (myArray[i] !== '0') {
//         flag = 1
//         break
//       }
//     }
//     var {img, size, palette, userId} = req.body

//     if (flag) {
//         Pix.create({img, size, palette, userId})
//         .then(pix => {
//           res.status(201).json(pix)
//         })
//         .catch(err => {
//           console.log(err)
//         })
//     } else {
//       res.status(201).json({message: 'submitted pix is blank'})
//     }
//   })

//   .put('/pix/:id', (req, res, next) => {
//     var myArray = req.body.img
//     var flag = 0
//     var pix_id = req.params.id
//     req.body.priority = Date.parse(new Date()) / 1000

//     for (i = 0; i < myArray.length; ++i) {
//       if (myArray[i] !== '0') {
//         flag = 1
//         break
//       }
//     }

//     if (flag) {
//       Pix.findByPk(pix_id)
//         .then(pix => {
//           pix.img = req.body.img
//           pix.palette = req.body.palette
//           pix.size = req.body.size
//           return pix.save()
//         })
//         .then(pix => {
//           res.status(201).json(pix)
//         })
//         .catch(err => {
//           console.log(err)
//         })
//     } else {
//       res.status(201).json({message: 'submitted pix is blank'})
//     }
//   })

//   .delete('/:id', (req, res, next) => {
//     Pix.findOne({
//       where: {id: req.params.id},
//     })
//     .then(pix => {
//       return pix.destroy()
//     })
//     .then(pix => {
//       res.status(200).json(pix)
//     })
//   })
