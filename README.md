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

## The Plugins

Right now, there are three plugins.

### logger

The logger plugin simply writes logs of all the channels the client has joined to disk in the `log` directory.

### eightball

This is a dumb game where you ask a yes/no question and jIRC responds with a random answer. To ask a question, anyone in the channel can use either of these commands:

    .8ball
    .eightball

For example:

    <SomeGuyInTheChannel> .8ball Is this an incredibly stupid game?
    <jIRC> Definitely!

### communicator

This plugin is an **INCREDIBLY INSECURE** way to have jIRC send custom messages into a channel by sending it carefully formed HTTP requests. There's a config file at `plugins/communicator.json` that lets you set the HTTP server listening port and a password (in plaintext; how's that for security?). By default, the port is `3000` and the password is `password`. With default settings, you can convince jIRC to say something by running a `curl`:

    curl 'http://jIRCserverHost/?pw=password&client=ClientNameFromConfig&channel=ChannelName&message=A%20message'

Fancy.

But keep in mind that all passwords are sent over an unencrypted connection in plaintext, and so this is easily compromised. The intended purpose of this plugin is to let you automate messages from some other source (think notifications from another application). To secure that, you should stick it behind a firewall and make sure that the only thing that can successfully get a request through is the application itself. I'll let you work out those details.

### dice

Returns die rolls. Accepts commands in the form of:

    .dice #d#

The first number is the number of dice to roll. The second number is how many sides are on each die. For example:

    <SomeGuyInTheChannel> .dice 4d20
    <jIRC> 4,16,12,9

## Writing Plugins

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
