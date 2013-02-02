var http = require('http'),
    static = require('node-static');
    fs = require('fs'),
    osc = require('osc-min'),
    dgram = require('dgram'),
    path = require('path');
    udp = dgram.createSocket('udp4');

var outport = 41234;

var file = new(static.Server)();

http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8080);

var io = require('socket.io').listen(8081);

io.set("origins = *");
io.set("log level", 1); // reduce logging

function sendOSC(oscAddress, state) {
  var buf;
  if (oscAddress != undefined) {
    var address = "/" + oscAddress;
    buf = osc.toBuffer({
      address: address,
      args: [state]
    })
    // console.log(address);
    return udp.send(buf, 0, buf.length, outport, "localhost");
  };
};

var usernames = {};

user = new Object();
user.userName = "Blah";
user.assignedButtons = [0,1];

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// Get the size of an object
var usersCount;

function sortButtons () {
  console.log('Dividing buttons among '+usersCount+ ' users');
  switch (usersCount) {
    case 1:
      return [0, 1];
    case 2:
      return [2, 3];
    case 3:
      return [0, 2];
    case 4:
      return [0, 1, 2, 3];
    default:
      return [0, 1, 2, 3];
  }
    
}

function addUser(name, assignedButtons) {
  this.userName = name;
  this.assignedButtons = assignedButtons;
}

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
    console.log("User connected");

  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(username){
    // we store the username in the socket session for this client
    socket.username = username;

    // set up a new user object and pre-populate it
    var newUser = new addUser(username, [0, 1, 2, 3]);

    console.log('New user = ' + newUser.userName);

    // add the client's username to the global list
    usernames[username] = newUser;
    
    // recalculate number of users
    usersCount = Object.size(usernames);

    // assign this user some buttons
    newUser.assignedButtons = sortButtons();

    console.log(usernames);

    // tell client to update its view
    socket.emit('assignButtons', newUser.userName, newUser.assignedButtons);

  });



  socket.on('didAccelerate', function(tilt) {
    // console.log('Tilt = ' + tilt);
    sendOSC(sendOSC("accelX", tilt[0]));
    sendOSC(sendOSC("accelY", tilt[1]));
  });

  socket.on('buttonPressed', function(buttonIndex) {
    console.log('Button pressed = ' + buttonIndex);
    sendOSC(sendOSC("button" + buttonIndex, 1));
  });

  socket.on('buttonReleased', function(buttonIndex) {
    console.log('Button released = ' + buttonIndex);
    sendOSC(sendOSC("button" + buttonIndex, 0));
  });
  
  // when the user disconnects.. perform this
  socket.on('disconnect', function(){

  });

});