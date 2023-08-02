const users = require('./users.json')
const channels = require('./channels.json')
const channelsInvites = require('./channel_invites.json')
const channelsMembers = require('./channel_members.json')
const verifications = require('./verifications.json')

const tableMapping = {
   users: users,
   verifications: verifications,
   channels: channels,
   channel_invites: channelsInvites,
   channel_members: channelsMembers,
}

console.log(tableMapping)
