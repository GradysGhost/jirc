plugins.help = {

  message : function(client, from, channel, text, message) {
    if (text.indexOf(config.commandChar + 'help') === 0) {
      var commands = [];
      for (var p in plugins) {
        if (plugins[p].help) {
          var pluginCommands = plugins[p].help();
          for (var c = 0; c < pluginCommands.length; ++c) {
            commands.push(pluginCommands[c]);
          }
        }
      }

      commands.sort();

      say(client, channel,
	    'I\'m a jIRC bot. I support the following commands:'
	  );
      for (var c = 0; c < commands.length; ++c) {
        say(client, channel, commands[c]);
      }
      say(client, channel, 'My home: https://github.com/GradysGhost/jirc');
    }
  }

}
