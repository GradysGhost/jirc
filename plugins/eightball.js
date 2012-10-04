plugins.eightball = {
	responses : [
		"Definitely!",
		"Maybe.",
		"Certainly not.",
		"Could be.",
		"Yes, probably.",
		"Not a chance!",
		"Most likely.",
		"Unlikely.",
		"Maybe yes, no?"
	],
	message : function(client, from, channel, text, message) {
		if (text.indexOf(config.commandChar + "eightball") == 0 || text.indexOf(config.commandChar + "8ball") == 0) {
			var response = plugins.eightball.responses[Math.floor(Math.random() * plugins.eightball.responses.length)]
			say(client, channel, response);
			if (plugins.logger) {
				plugins.logger.log(channel, "<" + client.nick + "> " + response);
			}
		}
	}
};
