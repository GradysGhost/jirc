plugins.logger = {
	streams : {},
	message : function(client, from, channel, text, message) {
		debugger;
		var chan = channel.replace(/\W/, '');
		if (!plugins.logger.streams["s" + chan]) {
			plugins.logger.streams["s" + chan] = fs.createWriteStream("./log/" + channel);
		}
		
		var d = new Date();
		plugins.logger.streams["s" + chan].write(
			"[" + d.getMonth() + "-" + d.getDate() + "-" + d.getFullYear() +
			" " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + 
			"." + d.getMilliseconds() + "] " +
			"<" + from + "> " + text + "\n", "utf8"
		);
	},
	shutdown : function() {
		for (var s in plugins.logger.streams) {
			plugins.logger.streams[s].end();
		}
	}
};
