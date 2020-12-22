const router = require('express').Router()
module.exports = router

router.use('/users', require('./users'))
router.use('/comments', require('./comments'))
router.use('/videos', require('./vid'))
router.use('/timeslots', require('./timeslots'))
router.use('/channels', require('./channels'))
router.use('/playlist', require('./playlist'))
// router.use('/posts', require('./posts'))
router.use('/pix', require('./pix'))

router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
