// ========================
// ==== Express server ====
// ========================
var express = require("express");
var app = express();
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});
app.listen(8889);

// ============================
// ==== MongoDB Connection ====
// ============================
var mongo = require('mongodb');
var host = 'localhost';
var port = mongo.Connection.DEFAULT_PORT;

var optionsWithEnableWriteAccess = { w: 1 };
var dbName = 'testDb';

var client = new mongo.Db(
    dbName,
    new mongo.Server(host, port),
    optionsWithEnableWriteAccess
);

function openDb(onOpen){
    client.open(onDbReady);

    function onDbReady(error){
        if (error)
            throw error;
        client.collection('testCollection', onTestCollectionReady);
    }

    function onTestCollectionReady(error, testCollection){
        if (error)
            throw error;

        onOpen(testCollection);
    }
}

function closeDb(){
    client.close();
}

// ========================
// === Socket.io server ===
// ========================
var io = require('socket.io').listen(8888);

io.sockets.on("connection", function(socket) {
  socket.on('msg', function(data) {
    // confirm success to sender
    socket.emit('status', { success: 'true'});
    // broadcast message to everyone else
    io.sockets.emit('newmsg', { body: data.body });
  });
});