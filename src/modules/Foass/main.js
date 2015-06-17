var util = require('util');
var http = require('http');

module.exports = function(bot, modules, config) {
  // { resource: amountOfArgumentsRequired
  var whitelist = {
      'off': 2,
      'you': 2,
      'this': 1,
      'that': 1,
      'everthing': 1,
      'everyone': 1,
      'donut': 2,
      'shakespeare': 2,
      'linus': 2,
      'king': 2,
      'pink': 1,
      'life': 1,
      'chainsaw': 2,
      'outside': 2,
      'thanks': 1,
      'flying': 1,
      'fascinatin': 1,
      'madison': 2,
      'cool': 1,
      'field': 3,
      'nugget': 2,
      'yoda': 2,
      'ballmer': 3,
      'what': 1,
      'because': 1,
      'caniuse': 2,
      'bye': 1,
      'diabetes': 1,
      'bus': 2,
      'xmls': 2,
      'xmas': 2,
      'bday': 2,
      'awesome': 1,
      'tucker': 1,
      'bucket': 1
  };
  var requestOptions = {
    hostname: 'www.foaas.com',
    port: 80,
    path: null, // set later
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  };
  var filter = /^foaas\s([a-zA-Z]+)\s?([a-zA-Z@]+)?\s?([a-zA-Z@]+)?\s?([a-zA-Z@]+)?/;

  bot.onPublicChatMessage(function(message, to, from) {
      var args = filter.exec(message);
      if(args === null) {
        return;
      }
      if(whitelist[args[1]] === undefined) {
        return;
      }
      var argCount = 0;
      var argRequiredArgCount = whitelist[args[1]];
      var query = '/' + args[1] + '/';
      for(var i = 2; i < 2+argRequiredArgCount; ++i) {
        if(args[i] === undefined) {
          continue;
        }
        ++argCount;
        query += args[i] + '/';
      }
      if(argCount !== argRequiredArgCount) {
        return;
      }
      requestOptions.path = query;
      http.get(
        requestOptions,
        function(res) {
          res.on('data', function(data) {
            /**
              * @todo check status code and such
              */
            var reply = JSON.parse(data.toString());
            bot.send(
              reply.message + ' ' + reply.subtitle,
              from.split("/")[0] // roomJid
            );
          });
        }
      );
    });
}
