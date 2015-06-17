var util = require("util");

module.exports = function(client, xmpp, modules, config) {
  /**
   * @var client  exposed for bootstrapping or beyond api
   */
  this.client = client;
  /**
   * { roomJidNick: [ participantNick, participantNick .. ], .. }
   * @var rooms  rooms the bot is currently in and participants in each room
   */
  var rooms = {};

  var addRoom = function(roomName) {
    rooms[roomName] = [];
  };

  /**
   * @todo Refactor this, it failed on participant join room and does not support multiple rooms 
   */
  var stanzaNotFromSelf = function(stanza) {
    if(stanza.from === undefined) {
      return true;
    }
    var room = (stanza.from.indexOf('/') > 0)
              ? stanza.from.split('/')[0] : stanza.from;
    return stanza.from !== room + '/' + config.bot.room_nick

  }

  this.unsetParticipantFromRoom = function(from) {
    var jidNick = from.split('/');
    delete rooms[jidNick[0]][jidNick[1]];
  };

  this.addParticipantToRoom = function(from) {
    var jidNick = from.split('/');
    rooms[jidNick[0]].push(jidNick[1]);
  };

  // Example : bot.getParticipantsByRoom('365577_bottest@conf.hipchat.com')
  this.getParticipantsByRoom = function(roomName) {
    if(rooms[roomName] === undefined) {
      return;
    }
    return rooms[roomName];
  };

  this.onParticipantLeaveRoom = function(callback) {
    client.on('stanza', function(stanza) {
      if(stanza.getChild('x') === undefined) {
        return;
      }
      if(stanza.getChild('x').getChild('item') === undefined) {
        return;
      }
      if(stanza.getChild('x').getChild('item').attrs.role !== 'none') {
        return;
      }
      callback(from);
    });
  };

  // this event is fired for every person in a room upon joining and afterwards
  // each time someone joins or leaves the room.
  this.onParticipantJoinRoom = function(callback) {
    client.on('stanza', function(stanza) {
      if(stanza.is('presence') === false) {
        return;
      }
      if(stanza.from.split('||')[0].split('/')[1] === config.bot.room_nick) {
        return;
      }
      if(stanza.from.split('/')[1] === config.bot.room_nick) {
        return;
      }
      if(stanza.getChild('x') === undefined) {
        return;
      }
      var item = stanza.getChild('x').getChild('item');
      if(item === undefined) {
        return;
      }
      if(item.attrs.role !== 'participant') {
        return;
      }
      callback(stanza.from);
    });
  };

  this.onPrivateChatMessage = function(callback) {
    client.on('stanza', function(stanza) {
      if( stanza.is('message') === false || stanza.attrs.type !== 'chat') {
        return;
      }
      if(stanzaNotFromSelf(stanza) === false) {
        return;
      }
      var body = stanza.getChild('body');
      if ( ! body) {
        return;
      }
      callback(body.getText(), stanza.to, stanza.from);
    });
  }

  this.onPublicChatMessage = function(callback) {
    client.on('stanza', function(stanza) {
      // Ignore if not room message
      if( stanza.is('message') === false || stanza.attrs.type !== 'groupchat') {
        return;
      }
      if(stanzaNotFromSelf(stanza) === false) {
        return;
      }
      var body = stanza.getChild('body');
      if ( ! body) {
        return;
      }
      callback(body.getText(), stanza.to, stanza.from);
    });
  };

  this.getRooms = function() {
    var roomNames = [];
    for(roomName in rooms) {
      roomNames.push(roomName);
    }
    return roomNames;
  };

  this.join = function(jid, nick, callback) {
    var presence = new xmpp.Element('presence', {
      to: jid + '/' + nick
    });
    if(callback) {
      callback(presence);
    } else {
      presence.c('x', { xmlns: 'http://jabber.org/protocol/muc' });
    }
    client.send(
      presence
    );
    addRoom(jid);
  };

  this.leave = function(jidNick) {
    delete rooms[jidNick];
    var presence = new xmpp.Element('presence', {
      to: jidNick,
      type: 'unavailable'
    });
    client.send(presence);
    util.log('Left room ' + jidNick);
  };

  this.showAsAvailable = function() {
    var presence = new xmpp.Element('presence', { type: 'available' });
    presence.c('show').t('chat');
    client.send(presence);
    util.log('Bot presence is available');
  }

  this.showAsOffline = function() {
    var presence = new xmpp.Element('presence', { type: 'unavailable' });
    presence.c('show').t('chat');
    client.send(presence);
    util.log('Bot presence is unavailable');
  }

  this.showAsAway = function(status) {
    var presence = new xmpp.Element('presence', { type: 'available' });
    presence.c('show').t('away');
    if(status) {
      presence.c('status').t(status);
    }
    client.send(presence);
    util.log('Bot presence is away');
  }

  this.showAsBusy = function(status) {
    var presence = new xmpp.Element('presence', { type: 'available' });
    presence.c('show').t('dnd');
    if(status) {
      presence.c('status').t(status);
    }
    client.send(presence);
    util.log('Bot presence is busy');
  }

  this.send = function(message, jidNick) {
    var groupChatMessage = new xmpp.Element('message', { to: jidNick, type: 'groupchat' });
    groupChatMessage.c('body').t(message);
    client.send(
        groupChatMessage
    );
    util.log('Bot talking to ' + jidNick);
  };

  this.exit = function() {
    util.log('Shutting down bot');
    client.end();
    util.log('Have a nice day!');
    process.exit(0);
  }
};
