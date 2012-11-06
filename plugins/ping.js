plugins.ping = {
	message : function(client, from, channel, text, message) {
		if (text.indexOf(config.commandChar + "ping") == 0) {
			say(client, channel, from + ": pong");
		}
	},
	help : function() {
		return [
			"    " + config.commandChar + "ping -- Responds with a 'pong'"
		];
	}
};
