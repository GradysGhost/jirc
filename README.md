jirc
====

A node.js-based IRC bot with a basic plugin framework.

## Installation

Clone this git repo:

    git clone git@github.com:GradysGhost/jirc.git

Then `cd` to that directory and install the `irc` Node module:

    cd ./jirc
    npm install irc

## How It Works

The `irc` client calls functions when certain events occur on the IRC server. jirc forwards those calls up to plugins when they occur. The plugins react to the events.

Those events are:

 * message
 * registered
 * motd
 * names
 * topic
 * join
 * part
 * quit
 * kick
 * kill
 * notice
 * pm
 * ctcp
 * ctcpNotice
 * ctcpPrivmsg
 * ctcpVersion
 * nick
 * invite
 * modeAdded
 * modeRemoved
 * whois
 * channelListStart
 * channelListItem
 * channelList
 * raw
 * error

## Plugins

Writing a plugin is really easy. Start with this framework:

    plugins.uniquePluginName = {
    
    }

In those braces, add functions for the events you wish to handle. For example, if you just want to print messages to the console, try this:

    plugins.consoler = {
        message : function(client, from, channel, text, message) {
            console.log(from + " -> " + channel + "\t" + text);
        }
    }

That'll work. Here's a full listing of the event handlers and their function signatures:

 * `message(client, from, channel, text, message)`
 * `registered(client, message)`
 * `motd(client, motd)`
 * `names(client, channel, nicks)`
 * `topic(client, channel, topic, nick, message)`
 * `join(client, channel, nick, message)`
 * `part(client, channel, nick, reason, message)`
 * `quit(client, nick, reason, channels, message)`
 * `kick(client, channel, nick, by, reason, message)`
 * `kill(client, nick, reason, channels, message)`
 * `notice(client, nick, to, text, message)`
 * `pm(client, nick, text, message)`
 * `ctcp(client, from, to, text, type)`
 * `ctcpNotice(client, from, to, text)`
 * `ctcpPrivmsg(client, from, to, text)`
 * `ctcpVersion(client, from, to)`
 * `nick(client, oldNick, newNick, channels, message)`
 * `invite(client, channel, from, message)`
 * `modeAdded(client, channel, by, mode, argument, message)`
 * `modeRemoved(client, channel, by, mode, argument, message)`
 * `whois(client, info)`
 * `channelListStart(client)`
 * `channelListItem(client, channelInfo)`
 * `channelList(client, channels)`
 * `raw(client, message)`
 * `error(client, message)`

In all cases, `client` is an instance of `irc.Client` from the `irc` module.
