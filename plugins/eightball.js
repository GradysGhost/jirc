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
			client.say(channel, plugins.eightball.responses[Math.floor(Math.random() * plugins.eightball.responses.length)]);
		}
	}
};
