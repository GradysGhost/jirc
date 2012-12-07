plugins.logger = {
	streams : {},
	
	init : function() {
		for (var i in config.clients) {
			for (var j in config.clients[i].options.channels) {
				plugins.logger.checkForStream(config.clients[i].options.channels[j]);
			}
		}
	},
	
	checkForStream : function(channel) {
		var chan = channel.replace(/\W/, '');
		if (!plugins.logger.streams["s" + chan]) {
			plugins.logger.streams["s" + chan] = fs.createWriteStream("./log/" + channel, {'flags':'a'});
		}
		return plugins.logger.streams["s" + chan];
	},
	
	log : function(channel, message) {
		plugins.logger.checkForStream(channel);
		var chan = channel.replace(/\W/, '');
		var d = new Date();
		plugins.logger.streams["s" + chan].write(
			"[" + (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear() +
			" " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + 
			"." + d.getMilliseconds() + "] " + message + "\n", "utf8"
		);
	},
	
	message : function(client, from, channel, text, message) {
		plugins.logger.log(channel, "<" + from + "> " + text);
	},
	
	pm : function(client, nick, text, message) {
		plugins.logger.log(nick, text);
	},
	
	topic : function(client, channel, topic, nick, message) {
		plugins.logger.log(channel, "Topic (set by " + nick + "): " + topic);
	},
	
	join : function(client, channel, nick, message) {
		plugins.logger.log(channel, nick + " joined the channel.");
	},
	
	part : function(client, channel, nick, reason, message) {
		plugins.logger.log(channel, nick + " left the channel.");
	},
	
	kick : function(client, channel, nick, by, reason, message) {
		plugins.logger.log(channel, by + " kicked " + nick + ". \"" + reason + "\"");
	},
	
	kill : function(client, nick, reason, channels, message) {
		plugins.logger.log(channel, nick + " was killed. \"" + reason + "\"");
	},
	
	nick : function(client, oldNick, newNick, channels, message) {
		for (var i = 0; i < channels.length; ++i) {
			plugins.logger.log(channels[i], oldNick + " is now known as " + newNick);
		}
	},
	
	invite : function(client, channel, from, message) {
		plugins.logger.log(channel, from + " invited you to " + channel);
	},
	
	modeAdded : function(client, channel, by, mode, argument, message) {
		plugins.logger.log(channel, by + " set your mode to " + mode);
	},
	
	modeRemoved : function(client, channel, by, mode, argument, message) {
		plugins.logger.log(channel, by + " set your mode to " + mode);
	},
	
	shutdown : function() {
		for (var s in plugins.logger.streams) {
			plugins.logger.streams[s].end();
		}
	}
};
