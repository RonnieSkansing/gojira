var util = require("util");
//var eventEmitter = require('events').EventEmitter;
// ctor is different from the other modules..
module.exports = function(client, xmpp, modules, config) {
  this.client = client;
  //this.eventEmitter = eventEmitter;

  this.onPublicChatMessage = function(callback) {
    client.on("stanza", function(stanza) {
      // Ignore if not room message
      if ( ! stanza.is('message') || ! stanza.attrs.type === 'groupchat') {
        return;
      }
      if(stanza.from === undefined) {
        return;
      }
      // ignore messages sent by bot itself
      var room = (stanza.from.indexOf('/') > 0)
                 ? stanza.from.split('/')[0] : stanza.from;
      if (stanza.from === room + '/' + config.bot.room_nick) {
        return;
      }
      // Ignore empty messages like topic change
      var body = stanza.getChild('body');
      if ( ! body) {
        return;
      }
      callback(
        body.getText(),
        stanza.to,
        stanza.from
      );
    });
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
  };

  this.showAsAvailable = function() {
    var presence = new xmpp.Element('presence', { type: 'available' });
    presence.c('show').t('chat');
    client.send(presence);
  }

  this.showAsOffline = function() {
    var presence = new xmpp.Element('presence', { type: 'unavailable' });
    presence.c('show').t('chat');
    client.send(presence);
  }

  this.showAsAway = function(status) {
    var presence = new xmpp.Element('presence', { type: 'available' });
    presence.c('show').t('away');
    if(status) {
      presence.c('status').t(status);
    }
    client.send(presence);
  }

  this.showAsBusy = function(status) {
    var presence = new xmpp.Element('presence', { type: 'available' });
    presence.c('show').t('dnd');
    if(status) {
      presence.c('status').t(status);
    }
    client.send(presence);
  }

  this.send = function(message, jidNick) {
    var groupChatMessage = new xmpp.Element('message', { to: jidNick, type: 'groupchat' });
    groupChatMessage.c('body').t(message);
    client.send(
        groupChatMessage
    );
  };

  this.exit = function() {
    client.end();
    process.exit(0);
  }
};
