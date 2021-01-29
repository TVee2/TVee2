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

Timeslot.belongsTo(Program, {onDelete: 'cascade', hooks:true})
Timeslot.belongsTo(Channel, {onDelete: 'cascade', hooks:true})

Segment.belongsTo(Program)
Segment.belongsTo(Timeslot, {onDelete: 'cascade', hooks:true})
Segment.belongsTo(Channel, {onDelete: 'cascade', hooks:true, constraints:false})

Comment.belongsTo(User, {onDelete: 'cascade', hooks:true})
Comment.belongsTo(Channel, {onDelete: 'cascade', hooks:true})

Channel.hasMany(Segment, {onDelete:'cascade', hooks:true})
Channel.hasMany(Timeslot, {onDelete:'cascade', hooks:true})
Channel.belongsTo(User, {onDelete: 'cascade', hooks:true})
Channel.belongsTo(Playlist)
Channel.belongsTo(Program, {as:'defaultProgram', constraints:false})

Channel.belongsToMany(Hashtag, {through: 'channelhashtags'})
Hashtag.belongsToMany(Channel, {through: 'channelhashtags'})

Playlist.hasMany(PlaylistItem, {onDelete:'cascade', hooks:true})
Playlist.belongsTo(User, {onDelete: 'cascade', hooks:true})

Program.belongsTo(PlaylistItem)
PlaylistItem.belongsTo(Playlist, {onDelete: 'cascade', hooks:true})

Pix.belongsTo(User, {onDelete: 'cascade', hooks:true})
Program.belongsTo(User)
User.hasMany(Pix, {as: 'creations' , onDelete:'cascade', hooks:true})
User.belongsTo(Pix, {as: 'profilePix', constraints:false})

Channel.belongsToMany(User, {through: 'userfavchannel'})
User.belongsToMany(Channel, {as:"favoriteChannels", through: 'userfavchannel'})

User.hasMany(Channel, {onDelete:'cascade', hooks:true})

Post.belongsTo(Pix, {onDelete: 'cascade', hooks:true})
Post.belongsTo(Comment, {onDelete: 'cascade', hooks:true})
Post.belongsTo(User, {onDelete: 'cascade', hooks:true})
Post.belongsTo(Channel, {onDelete: 'cascade', hooks:true})

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
