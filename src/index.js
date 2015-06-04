require("babel/register");

var Hipchatter = require('hipchatter');
var conf = require('../conf/config');
var hipchatter = new Hipchatter(conf.user_token);

var testRoom = conf.rooms[0];

var express = require('express');
var morgan = require('morgan');

var app = express();
app.use(morgan('dev'));

app.get('*', function (req, res) {

    //hipchatter.notify(testRoom.name, "Awesome bot in da house!", testRoom.notification_token, function (err, res) {
    //    if (err) return console.log('what?', err) && process.exit(1);
    //});
    
    res.send({
        msg: "a ok!"
    });
});

var server = app.listen(3000, function () {

    var port = server.address().port;

    console.log('Webhook app listening at http://127.0.0.1:%s', port);


    //hipchatter.notify(testRoom.name, "Awesome bot in da house!", testRoom.notification_token, function (err, res) {
    //    if (err) return console.log('what?', err) && process.exit(1);
    //});

});
