const router = require('express').Router()
module.exports = router

router.use('/users', require('./users'))
router.use('/comments', require('./comments'))
router.use('/programs', require('./program'))
router.use('/timeslots', require('./timeslots'))
router.use('/channels', require('./channels'))
router.use('/playlists', require('./playlist'))
router.use('/pix', require('./pix'))

router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})
