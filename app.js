// ========================
// ==== Express server ====
// ========================
var express = require("express");
var app = express();
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'this is supposed to be secret, change it' }));
var mongoExpressAuth = require("mongo-express-auth");
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

// ============================
// ==== MongoDB Connection ====
// ============================
var mongo = require('mongodb');
var host = 'localhost';
var port = mongo.Connection.DEFAULT_PORT;

var optionsWithEnableWriteAccess = { w: 1 };
var dbName = 'hordeApp';

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
        client.collection('hordeStats', onTestCollectionReady);
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

//===========================
//  Authentication
//===========================

mongoExpressAuth.init({
    mongo: { 
        dbName: 'hordeApp',
        collectionName: 'accounts'
    }
}, function(){
    console.log('mongo ready!');
    app.listen(3000);
});

//===========================
//  routes
//===========================

app.get('/', function(req, res){
    mongoExpressAuth.checkLogin(req, res, function(err){
        if (err)
            res.sendfile('static/login.html');
        else
            res.sendfile('static/index.html');
    });
});

app.get('/me', function(req, res){
    mongoExpressAuth.checkLogin(req, res, function(err){
        if (err)
            res.send(err);
        else {
            mongoExpressAuth.getAccount(req, function(err, result){
                if (err)
                    res.send(err);
                else 
                    res.send(result); // NOTE: direct access to the database is a bad idea in a real app
            });
        }
    });
});

app.post('/login', function(req, res){
    mongoExpressAuth.login(req, res, function(err){
        if (err)
            res.send(err);
        else
            res.send('ok');
    });
});

app.post('/logout', function(req, res){
    mongoExpressAuth.logout(req, res);
    res.send('ok');
});

app.post('/register', function(req, res){
    mongoExpressAuth.register(req, function(err){
        if (err)
            res.send(err);
        else
            res.send('ok');
    });
});

app.use(express.static(__dirname + '/static/'));

// ========================
// === Socket.io server ===
// ========================
var io = require('socket.io').listen(8888);

var players = [];

function createPlayer(socket) {
    var player = new Object();
    player.id = socket.id;
    player.x;
    player.y;
    players[socket.id] = player;
}

io.sockets.on("connection", function(socket) {
    // createPlayer(socket);
    socket.on('sendPlayerToServer', function(data) {
        players[data.player.name] = data.player;
        // console.log(players);
    });

    socket.on('updatePlayerList', function() {
        socket.emit('playerList', {list: players});
        console.log(players);
    });

    // socket.on('disconnect', function(socket) {
    //     delete players[socket.id];
    // });

    // socket.on('getPlayerObj', function() {
    //     socket.emit('sendPlayerObj', {player: players[socket.id]});
    // });

    // socket.on('updatePlayerCoord', function(data) {
    //     players[socket.id] = data.player;
    //     console.log(players);
    // });
    // socket.on('object', function(data) {
    //     socket.broadcast.emit('objectMove', {x: data.x,
    //                                          y: data.y})
    // });
  // socket.on('msg', function(data) {
  //   // confirm success to sender
  //   socket.emit('status', { success: 'true'});
  //   // broadcast message to everyone else
  //   socket.broadcast.emit('newmsg', { body: data.body });
  // });
});

app.listen(8889);