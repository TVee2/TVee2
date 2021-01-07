const router = require('express').Router()
const {Playlist, PlaylistItem} = require('../db/models')
module.exports = router

const {uploadPlaylist} = require('./crudHelpers')

router.get('/', async (req, res, next) => {
  var userId = req.user.id
  try {
    const playlists = await Playlist.findAll({
      where:{userId},
      order:[['createdAt', 'DESC']],
      include:{model: PlaylistItem}
    })
    res.json(playlists)
  } catch (err) {
    res.status(500).json(err);
  }
})

.post('/ytplaylist/:plid', async (req, res, next) => {
  try {
    var playlist = await uploadPlaylist(req.params.plid, req.user)
    res.json(playlist)
  } catch (err) {
    res.status(500).json(err);
  }
})

.delete('/:id', async (req, res, next) => {
  var userId = req.user.id
  try {
    const playlist = await Playlist.findOne({
      where:{id:req.params.id, userId}
    })
    await playlist.destroy()
    res.json({action:"playlist deleted"})
  } catch (err) {
    res.status(500).json(err);
  }
})
