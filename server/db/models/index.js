const User = require('./user')
const Segment = require('./segment')
const Program = require('./program')
const Channel = require('./channel')
const Comment = require('./comment')
const Video = require('./video')
const Timeslot = require('./timeslot')
const Playlist = require('./playlist')
const PlaylistItem = require('./playlistItem')

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

Comment.belongsTo(User)
Comment.belongsTo(Channel)

Channel.hasMany(Segment)
Segment.belongsTo(Channel)
Channel.belongsTo(User)

Program.belongsTo(User)
Program.belongsToMany(Video, {through: "videosrc"})

Playlist.hasMany(PlaylistItem)
Playlist.belongsTo(User)

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
}
