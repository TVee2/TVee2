const router = require('express').Router()
const {Playlist, PlaylistItem} = require('../db/models')
module.exports = router

const {updateOrUploadPlaylist} = require('./crudHelpers')

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

.get('/all', (req, res, next)=>{
  Playlist.findAll({
    order: [['createdAt', 'DESC']],
  })
  .then((items)=>{
    res.status(200).json(items)
  })
})

.post('/ytplaylist/:plid', async (req, res, next) => {
  try {
    var playlist = await updateOrUploadPlaylists(req.params.plid, req.user)
    res.json(playlist)
  } catch (err) {
    res.status(500).json(err);
  }
})

.delete('/mine/:id', async (req, res, next) => {
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

.delete('/:id', (req, res, next) => {
  Playlist.findOne({
    where: {id: req.params.id}
  })
  .then((playlist) => {
    if(!req.user.admin || playlist.userId != req.user.id){
      throw new Error("forbidden")
    }
    if (playlist) {
      return playlist.destroy()
    } else {
      throw new Error('No playlist found with matching id.')
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
