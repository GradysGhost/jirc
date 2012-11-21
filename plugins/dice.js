plugins.dice = {
	message : function(client, from, channel, text, message) {
		if (debug) console.log(from + ", " + channel + ", " + text + ", " + message);
		if (text.indexOf(config.commandChar + "dice") == 0) {
			var parts = text.split(' ');
			if (parts.length > 1) {
				var matches = parts[1].match(/^\d+d\d+$/);
				if (matches) {
					var dice = matches[0].split('d')[0];
					var sides = matches[0].split('d')[1];
					if (debug) console.log("Dice: " + dice + "; Sides: " + sides);
					var rolls = [];
					if (dice <= 100 && sides <= 100) {
						for (var i = 1; i <= dice; ++i) {
							rolls.push(Math.ceil(Math.random() * sides));
						}
						say(client, channel, rolls.toString());
					} else {
						say(client, channel, "Sorry, I can roll no more than 100 dice with no more than 100 sides.");
					}
				} else {
					say(client, channel, "Command must be in the form of: " + config.commandChar + "dice <dice>d<sides>");
				}
			}
		}
	},
	help : function() {
		return [
			"    " + config.commandChar + "dice <count>d<sides> -- Roll <count> dice with <sides> sides each."
		];
	}
}
