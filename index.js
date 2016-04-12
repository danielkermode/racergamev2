//this method was easier (took it from socket.io docs) even though it's not es6
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

//store state in a variable since this is a small app. If this was larger could use a database.
let users = [];
//names in a separate array because they could differ; a user may connect but not enter a name
let names = [];

function checkName(names, name, id) {
  if(names.map(val => val.name).indexOf(name) > -1) {
    checkName(names, name + 'x', id);
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
  users.push(socket);
  io.emit('userCount', users.length);

  socket.on('requestUsers', function(name) {
    checkName(names, name, socket.id);
    socket.emit('respondUsername', names[names.length - 1].name);
    io.emit('respondUsers', names);
  });

  socket.on('challenge', function(data) {
    io.to(data.otherId).emit('challenged', data.challenger);
  })

  socket.on('meetChallenge', function(data) {
    const challenger = names.find(val => val.name === data.name);
    const challenged = names.find(val => val.name === data.me);
    io.to(challenger.id).emit('challengeResponse', data.answer);
    io.to(challenged.id).emit('challenged', false);
  })

  socket.on('disconnect', function() {
    const i = users.indexOf(socket);
    users.splice(i, 1);
    names = names.filter(element => element.id !== socket.id);
    io.emit('userCount', users.length);
    io.emit('respondUsers', names);
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});