// Includes
var fs = require('fs');
var irc = require('irc');

// Globals
var plugins = {};
var clients = {};

// Read config from config.json
var config = JSON.parse(fs.readFileSync("config.json", "utf8"));
if (!config) {
	console.log("Could not parse config.json");
	process.exit(1);
}

// Import the enabled plugins
for (var i = 0; i < config.plugins.length; ++i) {
	eval(fs.readFileSync(config.pluginDir + "/" + config.plugins[i] + ".js", "utf8"));
}

// These each handle an IRC event
var listeners = {
	message : function(from, channel, text, message) {
		debugger;
		for (var p in plugins) {
			var func = plugins[p].message || function (){};
			func(this, from, channel, text, message);
		}
	},
	registered : function(message) {
		for (var p in plugins) {
			var func = plugins[p].registered || function (){};
			func(this, message);
		}
	},
	motd : function(motd) {
		for (var p in plugins) {
			var func = plugins[p].motd || function (){};
			func(this, motd);
		}
	},
	names : function(channel, nicks) {
		for (var p in plugins) {
			var func = plugins[p].names || function (){};
			func(this, channel, nicks);
		}
	},
	topic : function(channel, topic, nick, message) {
		for (var p in plugins) {
			var func = plugins[p].topic || function (){};
			func(this, channel, topic, nick, message);
		}
	},
	join : function(channel, nick, message) {
		for (var p in plugins) {
			var func = plugins[p].join || function (){};
			func(this, channel, nick, message);
		}
	},
	part : function(channel, nick, reason, message) {
		for (var p in plugins) {
			var func = plugins[p].part || function (){};
			func(this, channel, nick, reason, message);
		}
	},
	quit : function(nick, reason, channels, message) {
		for (var p in plugins) {
			var func = plugins[p].quit || function (){};
			func(this, nick, reason, channels, message);
		}
	},
	kick : function(channel, nick, by, reason, message) {
		for (var p in plugins) {
			var func = plugins[p].kick || function (){};
			func(this, channel, nick, by, reason, message);
		}
	},
	kill : function(nick, reason, channels, message) {
		for (var p in plugins) {
			var func = plugins[p].kill || function (){};
			func(this, nick, reason, channels, message);
		}
	},
	notice : function(nick, to, text, message) {
		for (var p in plugins) {
			var func = plugins[p].notice || function (){};
			func(this, nick, to, text, message);
		}
	},
	pm : function(nick, text, message) {
		for (var p in plugins) {
			var func = plugins[p].pm || function (){};
			func(this, nick, text, message);
		}
	},
	ctcp : function(from, to, text, type) {
		for (var p in plugins) {
			var func = plugins[p].ctcp || function (){};
			func(this, from, to, text, type);
		}
	},
	ctcpNotice : function(from, to, text) {
		for (var p in plugins) {
			var func = plugins[p].ctcpNotice || function (){};
			func(this, from, to, text);
		}
	},
	ctcpPrivmsg : function(from, to, text) {
		for (var p in plugins) {
			var func = plugins[p].ctcpPrivmsg || function (){};
			func(this, from, to, text);
		}
	},
	ctcpVersion : function(from, to) {
		for (var p in plugins) {
			var func = plugins[p].ctcpVersion || function (){};
			func(this, from, to);
		}
	},
	nick : function(oldNick, newNick, channels, message) {
		for (var p in plugins) {
			var func = plugins[p].nick || function (){};
			func(this, oldNick, newNick, channels, message);
		}
	},
	invite : function(channel, from, message) {
		for (var p in plugins) {
			var func = plugins[p].invite || function (){};
			func(this, channel, from, message);
		}
	},
	modeAdded : function(channel, by, mode, argument, message) {
		for (var p in plugins) {
			var func = plugins[p].modeAdded || function (){};
			func(this, channel, by, mode, argument, message);
		}
	},
	modeRemoved : function(channel, by, mode, argument, message) {
		for (var p in plugins) {
			var func = plugins[p].modeRemoved || function (){};
			func(this, channel, by, mode, argument, message);
		}
	},
	whois : function(info) {
		for (var p in plugins) {
			var func = plugins[p].whois || function (){};
			func(this, info);
		}
	},
	channelListStart : function() {
		for (var p in plugins) {
			var func = plugins[p].channelListStart || function (){};
			func(this);
		}
	},
	channelListItem : function(channelInfo) {
		for (var p in plugins) {
			var func = plugins[p].channelListItem || function (){};
			func(this, channelInfo);
		}
	},
	channelList : function(channels) {
		for (var p in plugins) {
			var func = plugins[p].channelList || function (){};
			func(this, channels);
		}
	},
	raw : function(message) {
		for (var p in plugins) {
			var func = plugins[p].raw || function (){};
			func(this, message);
		}
	},
	error : function(message) {
		for (var p in plugins) {
			var func = plugins[p].error || function (){};
			func(this, message);
		}
	}
};

// Handle process interrupts
var TERM_SIGNAL = (process.platform === "win32" ? "CTRL_CLOSE_EVENT" : "SIGINT");
process.on(TERM_SIGNAL, function() {
	for (var p in plugins) {
		if (plugins[p].shutdown) {
			plugins[p].shutdown();
		}
	}
	process.exit(0);
});

// Initialize plugins
for (var p in plugins) {
	if (plugins[p].init) {
		plugins[p].init();
	}
}

// Connect each client...
for (var c in config.clients) {
	var conf = config.clients[c];
	clients[c] = new irc.Client(conf.host, conf.nick, conf.options);
	
	// Attach a listener to each of these IRC client events
	clients[c].addListener('message', listeners.message);
	clients[c].addListener('registered', listeners.registered);
	clients[c].addListener('motd', listeners.motd);
	clients[c].addListener('names', listeners.names);
	clients[c].addListener('topic', listeners.topic);
	clients[c].addListener('join', listeners.join);
	clients[c].addListener('part', listeners.part);
	clients[c].addListener('quit', listeners.quit);
	clients[c].addListener('kick', listeners.kick);
	clients[c].addListener('kill', listeners.kill);
	clients[c].addListener('notice', listeners.notice);
	clients[c].addListener('pm', listeners.pm);
	clients[c].addListener('ctcp', listeners.ctcp);
	clients[c].addListener('ctpc-notice', listeners.ctcpNotice);
	clients[c].addListener('ctpc-privmsg', listeners.ctcpPrivmsg);
	clients[c].addListener('ctpc-version', listeners.ctcpVersion);
	clients[c].addListener('nick', listeners.nick);
	clients[c].addListener('invite', listeners.invite);
	clients[c].addListener('+mode', listeners.modeAdded);
	clients[c].addListener('-mode', listeners.modeRemoved);
	clients[c].addListener('whois', listeners.whois);
	clients[c].addListener('channellist_start', listeners.channelListStart);
	clients[c].addListener('channellist_item', listeners.channelListItem);
	clients[c].addListener('channellist', listeners.channelList);
	clients[c].addListener('raw', listeners.raw);
	clients[c].addListener('error', listeners.error);
}
