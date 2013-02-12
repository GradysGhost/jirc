plugins.url = {
	
	init : function() {
		plugins.url.config = JSON.parse(fs.readFileSync("plugins/url.json"));
		plugins.url.config.cache = [];
		plugins.url.config.urlRegExp = /https?\:\/\/([^\s]*)/g
	},
	
	sayTitle : function (client, channel, message) {
		// If the title is a URL itself, we'll use the lower level IRC client
		// to send the message to avoid getting stuck in an infinite lookup loop
		var Encoder = require('node-html-encoder').Encoder;
		var e = new Encoder('entity');
		message = e.htmlDecode(message);
		if (message.match(plugins.url.config.urlRegExp)) {
			client.say(channel, message);
		} else {
			say(client, channel, message);
		}
	},
	
	message : function(client, from, channel, text, message) {
		var m = text.match(plugins.url.config.urlRegExp);
		if (m) {
			for (var i = 0; i < m.length; ++i) {
				var url = require('url').parse(m[i]);
				var cacheUrl = url.host + url.path;
				var found = false;
				
				for (var j = 0; j < plugins.url.config.cache.length; ++j) {
					// If the URL's been cached, pull from cache
					if (plugins.url.config.cache[j].url == cacheUrl) {
						found = true;
						var title = plugins.url.config.cache[j].title;
						plugins.url.sayTitle(client, channel, title);
					}
				}
				if (!found) {
					// If it hasn't been cached yet...
					// .. do the lookup...
					var options = {
						hostname : url.hostname,
						path : url.path
					};
					var request = require('http').request(options, function(response) {
						if (response.statusCode == 200) {
							var body = "";
							response.on('data', function(chunk) {
								body += chunk.toString("utf8");
							});
							response.on('end', function() {
								var title = body.match(/<title>(.*)<\/title>/i);
								if (title) {
									// Cache the title and an expiration timer
									var cleanup = setTimeout(function() {
										for (var k = 0; k < plugins.url.config.cache.length; ++k) {
											if (plugins.url.config.cache[k].url == cacheUrl) {
												plugins.url.config.cache.splice(k, 1);
												return;
											}
										}
									}, plugins.url.config.ttl * 1000);
									plugins.url.config.cache.push({
										"title" : title[1],
										"url" : cacheUrl,
										"cleanup" : cleanup
									});
									plugins.url.sayTitle(client, channel, title[1]);
								}
							});
						}
					});
					request.on('error', function(){});
					request.end();
				}
			}
		}
	}
};
