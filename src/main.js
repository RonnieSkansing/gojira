var util = require("util"),
    xmpp = require("node-xmpp"),
    config = require("../config/all.js"),
    repl = require("repl");
/**
 * load modules from config
 */
var modules = [];
for(moduleName in config.modules) {
  modules[moduleName] = require(
    config.modulePath + moduleName
    + '/' + config.modules[moduleName]
  );
}
/**
 * Bootstrap
 */
util.log('Connecting');
var bot = new modules['Bot'](
  new xmpp.Client({
    jid: config.bot.jid + '/bot',
    password: config.bot.password
  }),
  xmpp,
  null,
  config
);
// remove core client module as this
//  is injected into each module later
delete modules['Bot'];
bot.client.on('online', function() {
  util.log('Loading modules');
  for(moduleName in modules) {
    modules[moduleName](bot, modules, config);
    util.log('  ' + moduleName + ' loaded');
  }
  util.log('Setting up core event hooks');
  // keeps users in/out of room sync for functions like getParticipantsByRoom or getRooms
  bot.onParticipantJoinRoom(function(from) {
    bot.addParticipantToRoom(from);
  });
  bot.onParticipantLeaveRoom(function(from) {
    bot.unsetParticipantFromRoom(from);
  });
  /**
   * @todo refactor Multiple rooms
   */
  bot.join(
    config.bot.room_jid,
    config.bot.room_nick
  );
  bot.showAsAvailable();
  // keep alive or be disconnected
  setInterval(function() {
    bot.client.send(' ');
  }, 30000);
  util.log('Connected and ready');
  console.log('\n:: BOT REPL ::\n\nAvailable contexts: bot, config, modules\n');
  var replLoop = repl.start({
    prompt: 'GOJiRA> ',
    input: process.stdin,
    output: process.stdout
  });
  replLoop.context.bot = bot;
  replLoop.context.modules = modules;
  replLoop.context.config = config;
});
