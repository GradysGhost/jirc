plugins.autoident = {
	config : {},

	init : function() {
		plugins.autoident.config = JSON.parse(fs.readFileSync("plugins/autoident.json", "utf8"));
	},

	notice : function(client, nick, to, text, message) {
		if (text.match(plugins.autoident.config.respondTo)) {
			client.say(plugins.autoident.config.respondToNick, plugins.autoident.config.respondWith.replace('%P%', plugins.autoident.config.password));
		}
	}
};
