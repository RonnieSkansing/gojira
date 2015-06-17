var util = require("util");

module.exports = function(bot, modules, config) {
  bot.onPublicChatMessage(function(message, to, from) {
    var filter = /^random\s(-?\d+)\s(-?\d+)/;
    var matches = filter.exec(message);
    if(matches === null) {
      return;
    }
    if(matches[1] !== undefined && matches[2] !== undefined) {
      var min = parseInt(matches[1]);
      var max = parseInt(matches[2]);
      var random = Math.floor(Math.random() * (max - min + 1)) + min;
      var roomJid = from.split("/")[0];
      bot.send(
        random,
        roomJid
      );
    }
  });
};
