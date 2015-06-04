var Hipchatter = require('hipchatter');
var conf = require('./conf/config');
var hipchatter = new Hipchatter(conf.user_token);
var testRoom = conf.rooms[0];


function debug(err, data) {
    if (err) {
        return console.log("ERROR", err);
    }
    console.log(data);

}
function debugList(err, data) {
    if (err) {
        return console.log("ERROR", err);
    }
    console.log(data.items[0]);
    console.log("length : " + data.items.length);
}


function listAllRooms() {
    hipchatter.rooms(debug);
}
//listAllRooms();

function getAllHistory() {
    hipchatter.history(conf.rooms[0].name, debugList);
}
//getAllHistory();

function setTopic() {
    hipchatter.set_topic(testRoom.name, 'Spam, Ham, Eggs and Spam', debug);
}
//setTopic(); 

function notifyRoom() {
    hipchatter.notify(testRoom.name, "You can consider yourself notified!", testRoom.notification_token, debug);
}
//notifyRoom(); 

function listParticipants() {
    hipchatter.get_participants(testRoom.name, debug);
}
//listParticipants();


function createWebhook() {
    hipchatter.create_webhook(testRoom.name, {
        "url": conf.webhook_url + "/room/" + testRoom.name,
        "event": "room_message",
        "name": "test_hook"
    }, debug);
}
createWebhook();

function listWebhooks() {
    hipchatter.webhooks(testRoom.name, debug);
}
listWebhooks();


//  using endpoints not yet implemented
//hipchatter.request('post', '/room/BotTest/message', {"message": "http://i.giphy.com/28A92fQr8uG6Q.gif"}, function (err, rooms) {
//
//    if (!err) console.log(rooms); else console.log(err)
//});
