plugins.eightball = {
	responses : [
		"Definitely!",
		"Maybe.",
		"Certainly not.",
		"Could be.",
		"Yes, probably.",
		"Not a chance!",
		"Most likely.",
		"Unlikely."
	],
	message : function(client, from, channel, text, message) {
		if (text.indexOf(".eightball") == 0 || text.indexOf(".8ball") == 0) {
			var response = plugins.eightball.responses[Math.floor(Math.random() * plugins.eightball.responses.length)]
			client.say(channel, response);
			if (plugins.logger) {
				plugins.logger.log(channel, "<" + client.nick + "> " + response);
			}
		}
	}
};
