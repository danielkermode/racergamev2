//this method was easier (took it from socket.io docs) even though it's not es6
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const url = require('url');

//store state in a variable since this is a small app. If this was larger could use a database.
let users = [];
//names in a separate array because they could differ; a user may connect but not enter a name
let names = [];
//rooms that players will be playing in
let rooms = [];

//recursively check names to avoid conflicts (underscore will be added for each duplicate)
function checkName(names, name, id) {
  if(names.map(val => val.name).indexOf(name) > -1) {
    checkName(names, name + '_', id);
  } else {
    names.push({ name, id });
    return name;
  }
}

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/public/index.html');
});

app.use(express.static('client/public'));

io.sockets.on('connection', function(socket) {
  console.log('connected');

  /*Special logic for game rooms only*/
  rooms.forEach(room => {
    console.log(room.name)
    room.on('connection', function(socket) {
      console.log('room exists and connected someone');
      console.log(room.name);
      return;
    })
    return;
  });
  /***********Done************/

  users.push(socket);
  io.emit('userCount', users.length);

  socket.on('requestUsers', function(name) {
    checkName(names, name, socket.id);
    socket.emit('respondUsername', names[names.length - 1].name);
    io.emit('respondUsers', names);
  });

  socket.on('challenge', function(data) {
    const challenged = names.find(val => val.name === data.challenged);
    io.to(challenged.id).emit('challenged', data.challenger);
  })

  socket.on('meetChallenge', function(data) {
    const challenger = names.find(val => val.name === data.challenger);
    const challenged = names.find(val => val.name === data.challenged);
    io.to(challenger.id).emit('challengeResponse', data.answer);
    io.to(challenged.id).emit('challenged', false);
  })

  socket.on('requestRoom', function(data) {
    const challenger = names.find(val => val.name === data.challenger);
    const challenged = names.find(val => val.name === data.challenged);
    //make room and add it to array
    const nsp = io.of('/' + data.challenger);
    rooms.push(nsp);
    io.to(challenger.id).emit('roomResponse', '/' + data.challenger);
    challenger.id !== challenged.id &&
    io.to(challenged.id).emit('roomResponse', '/' + data.challenger);
  })

  socket.on('disconnect', function() {
    console.log('disconnection')
    const i = users.indexOf(socket);
    users.splice(i, 1);
    names = names.filter(element => element.id !== socket.id);
    io.emit('userCount', users.length);
    io.emit('respondUsers', names);
  });
});

http.listen(process.env.PORT || 3000, function() {
  console.log('listening on port ' + (process.env.PORT || 3000));
});

