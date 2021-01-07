const {User, Pix} = require('../db/models')
const colors = require('../colors.js')

module.exports = require('express')
  .Router()

  .get('/colors', (req, res, next)=>{
    res.status(200).json(colors)
  })

  .get('/icons', (req, res, next) => {
    let limit = 18
    Pix.findAll({
      order: [['id', 'DESC']],
      limit: limit,
      where: {userId: req.user.id},
    })
    .then(pixs => {
      res
        .status(200)
        .json({
          result: pixs,
        })
    })
    .catch(err => {
      res.status(500).send(err)
    })
  })

  .get('/:page', (req, res, next) => {
    let limit = 7
    let offset = 0
    Pix.findAndCountAll({where: {userId: req.user.id}}).then(data => {
      let page = req.params.page
      let pages = Math.ceil(data.count / limit)
      offset = limit * (page - 1)

      Pix.findAll({
        order: [['id', 'DESC']],
        limit: limit,
        offset: offset,
        where: {userId: req.user.id},
      })
      .then(pixs => {
        res
          .status(200)
          .json({
            result: pixs,
            count: data.count,
            limit: pixs.length,
            page: Number(req.params.page),
            pages: pages
          })
      })
      .catch(err => {
        res.status(500).send(err)
      })
    })
  })

  .post('/', (req, res, next) => {
    var myArray = req.body.img
    req.body.userId = req.user.id
    var flag = 0

    req.body.priority = Date.parse(new Date()) / 1000

    for (i = 0; i < myArray.length; ++i) {
      if (myArray[i] !== '0') {
        flag = 1
        break
      }
    }
    if (flag) {
      Pix.create(req.body)
        .then(pix => {
          res.status(201).json(pix)
        })
        .catch(err => {
          res.status(500).send(err)
        })
    } else {
      res.status(201).json({message: 'submitted pix is blank'})
    }
  })

  .put('/:id', (req, res, next) => {
    var myArray = req.body.img
    var flag = 0
    var pix_id = req.params.id
    req.body.priority = Date.parse(new Date()) / 1000

    for (i = 0; i < myArray.length; ++i) {
      if (myArray[i] !== '0') {
        flag = 1
        break
      }
    }

    if (flag) {
      Pix.findByPk(pix_id)
        .then(pix => {
          pix.img = req.body.img
          pix.palette = req.body.palette
          pix.size = req.body.size
          return pix.save()
        })
        .then(pix => {
          res.status(201).json(pix)
        })
        .catch(err => {
          res.status(500).send(err)
        })
    } else {
      res.status(201).json({message: 'submitted pix is blank'})
    }
  })

  .delete('/:id', (req, res, next) => {
    Pix.findOne({
      where: {id: req.params.id},
    })
    .then(pix => {
      return pix.destroy()
    })
    .then(() => {
      return Pix.findAll({
        order: [['id', 'DESC']],
        where: {userId: req.user.id},
      })
    })
    .then(pixs => {
      res.status(200).json(pixs)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
  })
