const { channelID } = require('../config.json');
const { MessageAttachment } = require('discord.js');
const { prefix, token, serverID } = require('../config.json');
const Discord = require('discord.js');

module.exports = {
	name: 'ping',
	execute(message) {
		message.channel.send('pong');
	},
};
