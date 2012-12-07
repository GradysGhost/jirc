plugins.url = {
	message : function(client, from, channel, text, message) {
		var m = text.match(/https?\:\/\/([^\s]*)/g);
		if (m) {
			for (var i = 0; i < m.length; ++i) {
				var url = require('url').parse(m[i]);
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
								say(client, channel, title[1]);
							}
						});
					}
				});
				request.on('error', function(){});
			}
			request.end();
		}
	}
};
