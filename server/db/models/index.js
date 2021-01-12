const User = require('./user')
const Segment = require('./segment')
const Program = require('./program')
const Channel = require('./channel')
const Comment = require('./comment')
const Timeslot = require('./timeslot')
const Playlist = require('./playlist')
const PlaylistItem = require('./playlistItem')
const Pix = require('./pix')
const Post = require('./post')
const Hashtag = require('./hashtag')
const ChannelVisitLog = require('./channelVisitLog')

Timeslot.belongsTo(Program)
Timeslot.belongsTo(Channel)

Segment.belongsTo(Program)
Segment.belongsTo(Timeslot)
Segment.belongsTo(Channel)

Comment.belongsTo(User)
Comment.belongsTo(Channel)

Channel.hasMany(Segment)
Channel.hasMany(Timeslot)
Channel.hasMany(Hashtag)
Channel.belongsTo(User)
Channel.belongsTo(Playlist)
Channel.belongsTo(Program, {as:'defaultProgram', constraints:false})

Playlist.hasMany(PlaylistItem)
Playlist.belongsTo(User)

Program.belongsTo(PlaylistItem)
PlaylistItem.belongsTo(Playlist)

Pix.belongsTo(User)
Program.belongsTo(User)
User.hasMany(Pix, {as: 'creations'})
User.belongsTo(Pix, {as: 'profilePix', constraints:false})
User.hasMany(Channel, {as: 'createdChannels'})
User.hasMany(Channel, {as: 'favoriteChannels'})

Post.belongsTo(Pix)
Post.belongsTo(Comment)
Post.belongsTo(User)
Post.belongsTo(Channel)

ChannelVisitLog.belongsTo(User)
ChannelVisitLog.belongsTo(Channel)

module.exports = {
  Program,
  Channel,
  Segment,
  User,
  Comment,
  Timeslot,
  Playlist,
  PlaylistItem,
  Pix,
  Post,
  Hashtag,
  ChannelVisitLog,
}
