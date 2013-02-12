plugins.logbrowser = {
	config : {},
	
	logChanged : function(event, filename) {
		// If a file gets larger than the threshold, roll them over
		var stream = plugins.logger.checkForStream(filename);
		var stats = fs.statSync(stream.path);
		if (stats.size >= plugins.logbrowser.config.maxLogBytes) {
			// Find the next available file number
			var i = 1;
			while (fs.existsSync(stream.path + "." + i)) {
				++i;
			};
			
			// Close out the live file, move it, reopen the stream, start watching that file
			stream.end();
			fs.renameSync(stream.path, stream.path + "." + i);
			delete plugins.logger.streams["s" + filename.replace(/\W/, '')];
			var newStream = plugins.logger.checkForStream(filename);
			fs.watch(newStream.path, {"persistent":true}, plugins.logbrowser.logChanged);
		}
	},
	
	init : function() {
		if (!plugins.logger) return;
		// Read in the config file
		plugins.logbrowser.config = JSON.parse(fs.readFileSync("plugins/logbrowser.json", "utf8"));
		
		// Get a list of log files
		var files = fs.readdirSync("./log/");
		var logs = [];
		for (var i = 0; i < files.length; ++i) {
			if (files[i].match(/^#(.*)/)) {
				logs.push(files[i]);
			}
		}
		
		// Start watching logs
		for (var i in plugins.logger.streams) {
			fs.watch(plugins.logger.streams[i].path, {"persistent":true}, plugins.logbrowser.logChanged);
		}
		
		// Start an HTTP server
		require('http').createServer(function(request, response) {
			var Encoder = require('node-html-encoder').Encoder;
			var e = new Encoder('entity');
			
			// Parse the URL
			var u = require('url').parse(request.url, true);
			var q = u.query;
			
			// Always need that prologue
			var rbod = fs.readFileSync(plugins.logbrowser.config.docroot + "/" + plugins.logbrowser.config.prologue, "utf8");
			
			// Decode the important parts, set defaults where reasonable
			if (q.chan) q.chan = decodeURIComponent(q.chan);
			q.q = ((typeof q.q !== "undefined") ? decodeURIComponent(q.q) : "");
			q.a = ((typeof q.a !== "undefined") ? parseInt(decodeURIComponent(q.a)) : 0);
			q.b = ((typeof q.b !== "undefined") ? parseInt(decodeURIComponent(q.b)) : 0);
			q.p = ((typeof q.p !== "undefined") ? parseInt(decodeURIComponent(q.p)) : 0);
			if (q.a < 0) q.a = 0;
			if (q.b < 0) q.b = 0;
			if (q.p < 0) q.p = 0;
			
			// Page generation
			if (q.chan) { // If a channel was given...
				if (fs.existsSync("./log/" + q.chan)) {  // ...and if the requested channel exists...
					// Some heading stuff
					rbod += "<h2>Channel log: " + q.chan + "</h2>";
					rbod += "<form action=\"/\" method=\"GET\"><p>Search " + q.chan + ": <input type=\"hidden\" name=\"chan\" value=\"" + q.chan + "\" /><input type=\"search\" name=\"q\" size=\"15\" value=\"" + q.q + "\" /> ";
					rbod += "Lines before: <input type=\"text\" name=\"b\" value=\"" + q.b + "\" size=\"3\" /> Lines after: <input type=\"text\" name=\"a\" value=\"" + q.a + "\" size=\"3\" /> <input type=\"submit\" value=\"Search\" /></form></p>";
					if (q.q) {  // Are we attempting a search? If yes...
						rbod += "<h3>Search: " + q.q + "</h3>";
						// Sanitize the regexp input
						var regex = new RegExp(q.q.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&'), "ig");
						var lines = fs.readFileSync("./log/" + q.chan, "utf8").split('\n');
						
						var i = 1;
						while (fs.existsSync("./log/" + q.chan + "." + i)) {
							var nextLines = fs.readFileSync("./log/" + q.chan + "." + i, "utf8").split('\n');
							for (var j = 0; j < nextLines.length; ++j) {
								lines.push(nextLines[j]);
							}
							++i;
						};
						
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
					} else {  // Not attempting a search, load the page of logs
						var file = q.chan;
						if (q.p != 0) {
							file += "." + q.p;
						}
						
						// Find largest backlog number
						var lim = 1;
						while (fs.existsSync("./log/" + q.chan + "." + (lim + 1))) {
							++lim;
						};
						
						var prev = q.p - 1;
						var next = q.p + 1;
						
						if (prev < 0) prev = lim;
						if (next > lim) next = 0;
						
						// Display pagination options
						rbod += "<p class=\"pagelist\">";
						if (q.p <= lim && q.p != 1) {
							rbod += "<a href=\"/?chan=" + encodeURIComponent(q.chan) + "&p=" + prev + "\">&laquo;</a>";
						}
						if (q.p == 0) {
							rbod += "Page " + (lim + 1);
						} else {
							rbod += "Page " + q.p + " ";
						}
						if (q.p > 0) {
							rbod += "<a href=\"/?chan=" + encodeURIComponent(q.chan) + "&p=" + next + "\">&raquo;</a> ";
						}
						
						rbod += "<pre>" + e.htmlEncode(fs.readFileSync("./log/" + file, "utf8")) + "</pre>";
					}
				} else {  // But if the user has just given us a bad channel name...
						rbod += "<h2 class=\"error\">No such channel: " + q.chan + "</h2>";
				}
			} else	{  // If no channel name is given
				if (q.q) {  // Does the user want to run a global search?
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
				} else {  // Not doing a global search, and no channel provided, so just list the channels
					rbod += "<h2>Channels</h2><ul>";
					rbod += "<form action=\"/\" method=\"GET\"><p>Search all channels: <input type=\"search\" name=\"q\" size=\"15\" value=\"" + q.q + "\" /> ";
					rbod += "Lines before: <input type=\"text\" name=\"b\" value=\"" + q.b + "\" size=\"3\" /> Lines after: <input type=\"text\" name=\"a\" value=\"" + q.a + "\" size=\"3\" /> <input type=\"submit\" value=\"Search\" /></form></p>";
					for (var client in config.clients) {
						for (var channel in config.clients[client].options.channels) {
							rbod += "<li><a href=\"/?chan=" + encodeURIComponent(config.clients[client].options.channels[channel]) + "\">" + config.clients[client].options.channels[channel] + "</a></li>";
						}
					}
					rbod += "</ul>";
				}
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
