
var http = require('http');
var https = require('https');
var socketIo = require('socket.io');

var express = require('express');

var USERCOUNT = 3;

var app = express();
app.use(express.static('./p2p/server/client'));

app.get("/", (req, res) => {
    res.redirect(`./p2p/server/client/index.html`);
  });

//http server
var http_server = http.createServer(app);
http_server.listen(80, '0.0.0.0');

// var options = {
//         key : fs.readFileSync('./cert/rtcmedia.top.key'),
//         cert: fs.readFileSync('./cert/rtcmedia.top_bundle.pem')
// }

//https server
// var https_server = https.createServer(options, app);
var https_server = https.createServer(app);
var io = socketIo(http_server);


io.on('connection', (socket)=> {
    console.log(`connect sig server`);

    socket.on('message', (room, data)=>{
            socket.broadcast.to(room).emit('message',room, data);
    });

    socket.on('join', (room)=>{
            var myRoom = io.sockets.adapter.rooms.get(room);
            var users = myRoom.size;

            if(users + 1 < USERCOUNT){
                    socket.join(room);
                    socket.emit('joined', room, socket.id, users > 1);
                     //发给除自己之外的房间内的所有人
                    if(users > 1){
                            socket.to(room).emit('otherjoin', room, socket.id);
                    }

            }else{
                    socket.emit('full', room, socket.id);
            }
            //socket.emit('joined', room, socket.id); //发给自己
            //socket.broadcast.emit('joined', room, socket.id); //发给除自己之外的这个节点上的所有人
            //io.in(room).emit('joined', room, socket.id); //发给房间内的所有人
    });
    socket.on('leave', (room)=>{
        //var myRoom = io.sockets.adapter.rooms.get(room);
        //var users = (myRoom)? Object.keys(myRoom.sockets).length : 0;
        //logger.debug('the user number of room is: ' + (users-1));
        //socket.emit('leaved', room, socket.id);
        //socket.broadcast.emit('leaved', room, socket.id);
        socket.to(room).emit('bye', room, socket.id);
        socket.emit('leaved', room, socket.id);
        //io.in(room).emit('leaved', room, socket.id);
});

});

https_server.listen(443, '0.0.0.0');