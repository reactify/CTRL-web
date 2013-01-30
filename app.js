var app = require('http').createServer(handler), 
    io = require('socket.io').listen(app), 
    fs = require('fs'),
    osc = require('osc-min'),
    dgram = require('dgram'),
    udp = dgram.createSocket('udp4');

app.listen(8080);

var outport = 41234;

io.set("origins = *");
io.set("log level", 1); // reduce logging

var sendHeartbeat;

function sendOSC(button, state) {
  var buf;
  var address = "button" + button;
  buf = osc.toBuffer({
    address: address,
    args: [
      new Buffer("beat"), {
        type: "integer",
        value: 7
      }
    ]
  });
  console.log(address);
  return udp.send(buf, 0, buf.length, outport, "localhost");
};

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    // add needed headers
    var headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    // headers["content-type"] = 'text/json'; // mmm json
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";
    // respond to the request
    res.writeHead(200, headers);
    res.end(data);
  });
};


io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  // socket.on('my other event', function (data) {
  //   console.log(data);
  // });
  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(username){
    // echo to client they've connected
    socket.emit('updatechat', 'SERVER', 'you have connected');
    // update the list of users in chat, client-side


    // console.log(xPositions);
  });

  socket.on('buttonPressed', function(buttonIndex) {
    console.log('Button pressed = ' + buttonIndex);
    sendOSC(sendOSC(buttonIndex, 1));
  });

  socket.on('buttonReleased', function(buttonIndex) {
    console.log('Button released = ' + buttonIndex);
    sendOSC(sendOSC(buttonIndex, 0));
  });
  
  // when the user disconnects.. perform this
  socket.on('disconnect', function(){

  });

});