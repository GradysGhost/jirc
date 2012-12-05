plugins.logbrowser = {
	config : {},
	init : function() {
		plugins.logbrowser.config = JSON.parse(fs.readFileSync("plugins/communicator.json", "utf8"));
		require('http').createServer(function(request, response) {
			var u = require('url').parse(request.url, true);
			var q = u.query;
			var rbod = fs.readFileSync(plugins.logbrowser.config.docroot + "/" + plugins.logbrowser.config.prologue, "utf8");
			
			if (q.length == 0) {
				rbod += "<h2>Channels</h2><ul>";
				for (var file in fs.readDir("./log/")) {
					if (file.charAt(0) == "#") {
						rbod += "<li><a href='?channel=" + file + "'>" + file + "</a></li>";
					}
				}
				rbod += "</ul>";
			}
			
			rbod += fs.readFileSync(plugins.logbrowser.config.docroot + "/" + plugins.logbrowser.config.epilogue, "utf8");
		}).listen(plugins.logbrowser.config.port);
	}
};
