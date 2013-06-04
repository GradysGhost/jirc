plugins.eightball = {

  responses : [
    'Definitely!',
    'Maybe.',
    'Certainly not.',
    'Could be.',
    'Yes, probably.',
    'Not a chance!',
    'Most likely.',
    'Unlikely.',
    'Maybe yes, no?'
  ],

  message : function(client, from, channel, text, message) {
    if (text.indexOf(config.commandChar + 'eightball') === 0
	    || text.indexOf(config.commandChar + '8ball') === 0) {
      var response = plugins.eightball.responses[
	    Math.floor(Math.random() * plugins.eightball.responses.length)
	  ];
      say(client, channel, response);
    }
  },

  help : function() {
    return [
      '    ' + config.commandChar
	  + 'eightball <question> -- Responds to a binary <question>.'
      , '    ' + config.commandChar
	  + '8ball <question> -- Responds to a binary <question>.'
    ];
  }

};
