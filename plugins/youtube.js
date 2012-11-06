plugins.youtube = {
	
	config : {},
	
	init : function() {
		plugins.youtube.config = JSON.parse(fs.readFileSync("plugins/youtube.json"));
	},
	
	message : function(client, from, channel, text, message) {
		if (text.indexOf(config.commandChar + "youtube") == 0) {
			var query = text.substring(config.commandChar.length + 7)
				.replace(/^\s+/, '')  // JavaScript still lacks a trim function
				.replace(/\s+$/, ''); // for no good reason
			var options = {
				hostname : "gdata.youtube.com",
				path : "/feeds/api/videos?q=" + encodeURIComponent(query) + "&max-results=" +
				  plugins.youtube.config.results + "&v=2&alt=json"
			};
			var request = require('https').request(options, function(response) {
				var data = "";
				response.on('data', function(chunk) {
					data += chunk.toString("utf8");
				});
				response.on('end', function() {
					var json = JSON.parse(data);
					if (json.feed.entry) {
						for (var i = 0; i < json.feed.entry.length; ++i) {
							say(client, channel, json.feed.entry[i].link[0].href);
						}
					}
				});
			});
			request.on('error', function(error) {
				say(client, channel, "There was a problem querying YouTube.");
			});
			request.end();
		}
	},
	
	help : function() {
		return [
			"    " + config.commandChar + "youtube <query> -- Searches YouTube and returns the top " + this.config.results + " videos."
		];
	}
};
