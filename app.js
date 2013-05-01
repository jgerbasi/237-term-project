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
app.use(express.static(__dirname + '/static/'));

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

// open hordeStats colleciton
var hordeStats = null;

openDb(onDbOpen);

function onDbOpen(collection) {
    writeStats(collection, onWriteStats);
    hordeStats = collection;
}

function onWriteStats(err){
    if (err)
        throw err;
    console.log('documents inserted!');
    closeDb();
}

function writeStats(collection, done){
    var doc1 = { n: 1 };
    collection.insert(doc1, function(err){
        if (err){
            done(err);
            return;
        }
        var doc2 = { n: 2 };
        collection.insert(doc2, function(err){
            if (err){
                 done(err);
                 return;
            }
            var doc3 = { n: 3 };
            collection.insert(doc3, function(err){
                if (err){
                    done(err);
                    return;
                }
                var doc4 = { n: 4 };
                collection.insert(doc4, done);
            });
        });
    });
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
var routes = require('./routes');
routes.init(app, mongoExpressAuth);

function sendBackStats(res) {
    if (hordeStats !== null) {
        hordeStats.find({ user: "asdasd" }).each(function(object) {
            res.send({ });
        })
    } else {
        res.send({ error: "error not open"})
    }
}

// ========================
// === Socket.io server ===
// ========================
var socketServer = require('./socketServer');
socketServer.init();


app.listen(8889);