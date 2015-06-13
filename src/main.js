var util = require("util"),
    xmpp = require("node-xmpp"),
    config = require("../config/all.js");
/**
 * load modules from config
 */
var modules = [];
for(moduleName in config.modules) {
  modules[moduleName] = require(
    config.modulePath + moduleName
    + "/" + config.modules[moduleName]
  );
}
/**
 * Bootstrap
 */
util.log("Connecting");
var bot = new modules['Client'](
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
delete modules['Client'];
bot.client.on('online', function() {
  bot.join(
    config.bot.room_jid,
    config.bot.room_nick
  );
  bot.showAsAvailable();
  // keep alive or be disconnected
  setInterval(function() {
    bot.client.send(' ');
  }, 30000);
  /**
   * Inject core into modules
   */
  util.log("Firing up modules");
  for(moduleName in modules) {
    modules[moduleName](bot, xmpp, modules, config);
  }
  util.log("Connected");
});
