plugins.logbrowser = {
	config : {},
	init : function() {
		if (!plugins.logger) return;
		// Read in the config file
		plugins.logbrowser.config = JSON.parse(fs.readFileSync("plugins/logbrowser.json", "utf8"));
		
		// Start an HTTP server
		require('http').createServer(function(request, response) {
			var Encoder = require('node-html-encoder').Encoder;
			var e = new Encoder('entity');
			
			// Parse the URL
			var u = require('url').parse(request.url, true);
			var q = u.query;
			
			// Always need that prologue
			var rbod = fs.readFileSync(plugins.logbrowser.config.docroot + "/" + plugins.logbrowser.config.prologue, "utf8");
			
			// Decode the important parts
			if (q.chan) q.chan = decodeURIComponent(q.chan);
			if (q.q) q.q = decodeURIComponent(q.q);
			if (q.a) q.a = parseInt(decodeURIComponent(q.a));
			if (q.b) q.b = parseInt(decodeURIComponent(q.b));
			
			if (q.chan) {
				rbod += "<h2>Channel log: " + q.chan + "</h2>";
				rbod += "<form action=\"/\" method=\"GET\"><p>Search " + q.chan + ": <input type=\"hidden\" name=\"chan\" value=\"" + q.chan + "\" /><input type=\"search\" name=\"q\" size=\"15\" value=\"" + q.q + "\" /> ";
				rbod += "Lines before: <input type=\"text\" name=\"b\" value=\"" + q.b + "\" size=\"3\" /> Lines after: <input type=\"text\" name=\"a\" value=\"" + q.a + "\" size=\"3\" /> <input type=\"submit\" value=\"Search\" /></form></p>";
				// If the requested channel log exists
				try {
					if (fs.statSync("./log/" + q.chan)) {
						if (q.q) {  // Are we attempting a search?
							rbod += "<h3>Search: " + q.q + "</h3>";
							var regex = new RegExp(q.q, "ig");
							var lines = fs.readFileSync("./log/" + q.chan, "utf8").split('\n');
							for (var i = 0; i < lines.length; ++i) {
								var m = lines[i].match(regex);
								if (m) {
									rbod += "<pre>";
									if (q.b) {
										for (var j = i - q.b; j < i; ++j) {
											rbod += e.htmlEncode(lines[j]) + "\n";
										}
										rbod += "<span class=\"linematch\">";
									}
									rbod += e.htmlEncode(lines[i]).replace(regex, "<span class=\"querymatch\">" + q.q + "</span>") + "\n";
									if (q.a) {
										rbod += "</span>";
										for (var j = ++i; j < i + q.a; ++j) {
											rbod += e.htmlEncode(lines[j]) + "\n";
										}
									}
									rbod += "</pre>";
								}
							}
						} else {
							rbod += "<pre>" + e.htmlEncode(fs.readFileSync("./log/" + q.chan, "utf8")) + "</pre>";
						}
					}
				} catch (e) {
					rbod += "<h2 class=\"error\">No such channel: " + q.chan + "</h2>";
				}
			} else if (q.q) {
				// Search all channels
				rbod += "<h3>Search: " + q.q + "</h3>";
				rbod += "<form action=\"/\" method=\"GET\"><p>Search all channels: <input type=\"search\" name=\"q\" size=\"15\" value=\"" + q.q + "\" /> ";
				rbod += "Lines before: <input type=\"text\" name=\"b\" value=\"" + q.b + "\" size=\"3\" /> Lines after: <input type=\"text\" name=\"a\" value=\"" + q.a + "\" size=\"3\" /> <input type=\"submit\" value=\"Search\" /></form></p>";
				var regex = new RegExp(q.q, "i");
				
				var files = fs.readdirSync("./log/");
				for (var file in files) {
					rbod += "<h4>" + files[file] + "</h4>";
					var lines = fs.readFileSync("./log/" + files[file], "utf8").split('\n');
					for (var i = 0; i < lines.length; ++i) {
						var m = lines[i].match(regex);
						if (m) {
							rbod += "<pre>";
							if (q.b) {
								for (var j = i - q.b; j < i; ++j) {
									rbod += e.htmlEncode(lines[j]) + "\n";
								}
								rbod += "<span class=\"linematch\">";
							}
							rbod += e.htmlEncode(lines[i]).replace(regex, "<span class=\"querymatch\">" + q.q + "</span>") + "\n";
							if (q.a) {
								rbod += "</span>";
								for (var j = ++i; j < i + q.a; ++j) {
									rbod += e.htmlEncode(lines[j]) + "\n";
								}
							}
							rbod += "</pre>";
						}
					}
					rbod += "</pre>";
				}
			} else {
				rbod += "<h2>Channels</h2><ul>";
				rbod += "<form action=\"/\" method=\"GET\"><p>Search all channels: <input type=\"search\" name=\"q\" size=\"15\" value=\"" + q.q + "\" /> ";
				rbod += "Lines before: <input type=\"text\" name=\"b\" value=\"" + q.b + "\" size=\"3\" /> Lines after: <input type=\"text\" name=\"a\" value=\"" + q.a + "\" size=\"3\" /> <input type=\"submit\" value=\"Search\" /></form></p>";
				var files = fs.readdirSync("./log/");
				for (var file in files) {
					if (files[file].charAt(0) == "#") {
						rbod += "<li><a href='?chan=" + encodeURIComponent(files[file]) + "'>" + files[file] + "</a></li>";
					}
				}
				rbod += "</ul>";
			}
			
			// Dat epilogue
			rbod += fs.readFileSync(plugins.logbrowser.config.docroot + "/" + plugins.logbrowser.config.epilogue, "utf8");
			
			response.writeHead(200, {"content-type":"text/html", "length":rbod.length});
			response.end(rbod);
		}).listen(plugins.logbrowser.config.port);  // Listen on configured port
	},
	help : function() {
		return [
			"You can browse my logs at " + plugins.logbrowser.config.accessUrl
		];
	}
};
