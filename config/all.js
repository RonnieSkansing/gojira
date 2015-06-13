module.exports = {
  "debug": true,
  "src": "./",
  "bot": {
    "jid": " xxxx @chat.hipchat.com",
    "password": " xxxx ",
    "room_jid": " xxxx ",
    "room_nick": " xxxx "
  },
  "modulePath": "./modules/",
  "middlewares": {
    "foo": "main.js"
  },
  "modules": {
    "Client": "simpleClient.js",
    "Foass": "main.js",
    "Random": "main.js",
    "Ping": "main.js"
  }
};
