plugins.dice = {
	message : function(client, from, channel, text, message) {
		if (debug) console.log(from + ", " + channel + ", " + text + ", " + message);
		if (text.indexOf(".dice") == 0) {
			var parts = text.split(' ');
			var matches = parts[1].match(/^\d+d\d+$/);
			if (matches) {
				var dice = matches[0].split('d')[0];
				var sides = matches[0].split('d')[1];
				if (debug) console.log("Dice: " + dice + "; Sides: " + sides);
				var rolls = [];
				if (dice <= 100 || sides <= 100) {
					for (var i = 1; i <= dice; ++i) {
						rolls.push(Math.ceil(Math.random() * sides));
					}
					client.say(channel, rolls.toString());
					if (plugins.logger) {
						plugins.logger.log(channel, "<" + client.nick + "> " + rolls.toString());
					}
				} else {
					client.say(channel, "Sorry, I can roll no more than 100 dice with no more than 100 sides.");
				}
			} else {
				
			}
		}
	}
}
