const User = require('./user')
const Segment = require('./segment')
const Program = require('./program')
const Channel = require('./channel')
const Comment = require('./comment')
const Video = require('./video')
const Timeslot = require('./timeslot')
const Playlist = require('./playlist')
const PlaylistItem = require('./playlistItem')
const Pix = require('./pix')
/**
 * If we had any associations to make, this would be a great place to put them!
 * ex. if we had another model called BlogPost, we might say:
 *
 *    BlogPost.belongsTo(User)
 */

Timeslot.belongsTo(Program)
Timeslot.belongsTo(Channel)

Segment.belongsTo(Program)
Segment.belongsTo(Timeslot)
Segment.belongsTo(Channel)

Comment.belongsTo(User)
Comment.belongsTo(Channel)

Channel.hasMany(Segment)
Channel.belongsTo(User)
Channel.belongsTo(Playlist)

Program.belongsTo(User)
Program.belongsToMany(Video, {through: "videosrc"})

Playlist.hasMany(PlaylistItem)
Playlist.belongsTo(User)

Program.belongsTo(PlaylistItem)
PlaylistItem.belongsTo(Playlist)

Pix.belongsTo(User, {as: "creator", onDelete: 'cascade'})
User.hasMany(Pix)
User.belongsTo(Pix, {as: 'profilePicture', constraints:false})


/**
 * We'll export all of our models here, so that any time a module needs a model,
 * we can just require it from 'db/models'
 * for example, we can say: const {User} = require('../db/models')
 * instead of: const User = require('../db/models/user')
*/

module.exports = {
  Program,
  Channel,
  Segment,
  User,
  Comment,
  Video,
  Timeslot,
  Playlist,
  PlaylistItem,
  Pix
}
