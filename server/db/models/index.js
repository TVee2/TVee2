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
Segment.belongsTo(Program)

Segment.belongsTo(Channel, {constraints:false})
Channel.hasMany(Segment)

Timeslot.belongsTo(Channel)
Channel.hasMany(Timeslot, {onDelete: 'cascade', hooks:true})

Segment.belongsTo(Timeslot)
Timeslot.hasMany(Segment)

Channel.belongsTo(Playlist)

Channel.belongsTo(Program, {as:'defaultProgram', constraints:false})

Channel.belongsToMany(Hashtag, {through: 'channelhashtags'})
Hashtag.belongsToMany(Channel, {through: 'channelhashtags'})

Playlist.hasMany(PlaylistItem, {onDelete: 'cascade', hooks:true})

Playlist.belongsTo(User)
User.hasMany(Playlist, {onDelete: 'cascade', hooks:true})

Program.belongsTo(PlaylistItem)
PlaylistItem.belongsTo(Playlist)

Program.belongsTo(User)

Pix.belongsTo(User)
User.belongsTo(Pix, {as: 'profilePix', constraints:false})
User.hasMany(Pix, {as: 'creations', onDelete: 'cascade', hooks:true})

Channel.belongsToMany(User, {as:"favoriter", through: 'userfavchannel'})
User.belongsToMany(Channel, {as:"favoriteChannels", through: 'userfavchannel'})

Channel.belongsTo(User)
User.hasMany(Channel, {onDelete: 'cascade', hooks:true})

Post.belongsTo(Pix)
Post.belongsTo(Comment)
Post.belongsTo(User)
Post.belongsTo(Channel)
Channel.hasMany(Post, {onDelete: 'cascade', hooks:true})

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
