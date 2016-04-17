import { randLetter } from './utils';
//this method was easier (took it from socket.io docs) even though it's not es6
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const url = require('url');

//store state in a variable since this is a small app. If this was larger could use a database.
let users = [];
//names in a separate array because they could differ; a user may connect but not enter a name
//players in a game will be filtered from this names array.
let names = [];

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

  users.push(socket);
  io.emit('userCount', users.length);

  socket.on('requestUsers', function(name) {
    const userName = checkName(names, name, socket.id);
    socket.emit('respondUsername', userName);
    io.emit('respondUsers', names);
  });

  socket.on('challenge', function(data) {
    const challenged = names.find(val => val.name === data.challenged);
    const challenger = names.find(val => val.name === data.challenger);
    const challengerInd = names[names.findIndex(val => val.id === socket.id)];
    const challengedInd = names[names.findIndex(val => val.name === data.challenged)];

    if(challenger) names[names.findIndex(val => val.name === data.challenger)].inChallenge = true;
    if(challenged) names[names.findIndex(val => val.name === data.challenged)].inChallenge = true;

    if(!data.challenger) {
      data.challenger = { cancel: true };
      if(challengerInd) challengerInd.inChallenge = undefined;
      if(challengedInd) challengedInd.inChallenge = undefined;
    }

    if(challenged) io.to(challenged.id).emit('challenged', data.challenger);
    io.emit('respondUsers', names);
  });

  socket.on('meetChallenge', function(data) {
    const challenger = names.find(val => val.name === data.challenger);
    const challenged = names.find(val => val.name === data.challenged);
    const challengerInd = names[names.findIndex(val => val.name === data.challenger)];
    const challengedInd = names[names.findIndex(val => val.name === data.challenged)];

    if(challengerInd) challengerInd.inChallenge = undefined;
    if(challengedInd) challengedInd.inChallenge = undefined;
    io.emit('respondUsers', names);
    if(challenger) io.to(challenger.id).emit('challengeResponse', { answer: data.answer, challenged, challenger });
    socket.emit('challenged', false);
  });

  socket.on('requestRoom', function(data) {
    for(const key in data) {
      const current = names.find(val => val.name === data[key]);
      if(current) {
        const curSocket = users.find(val => val.id === current.id);
        const sockRooms = Object.keys(curSocket.rooms).map(key => curSocket.rooms[key]);
        if(sockRooms.indexOf(data.challenger) <= -1) {
          io.to(current.id).emit('roomResponse', data.challenger);
          curSocket.join(data.challenger);
          setTimeout(() => curSocket.emit('arrowResponse', randLetter()), 2000);
          names = names.filter(val => val.id !== curSocket.id);
          io.emit('respondUsers', names);
        }
      }
    }
  });

  socket.on('requestArrow', function(data) {
    //data will be the room, which we can just emit to giving both players a letter
    io.to(data.room).emit('arrowResponse', randLetter());
    //emit enemy distance
    socket.broadcast.to(data.room).emit('enemyDistance', data.distance);
  });

  socket.on('requestWinner', function(data) {
    //data will be the room, which we can just emit to giving both players a letter
    io.to(data.room).emit('winnerResponse', data.winner);
  });

  socket.on('leaveGame', function(data) {
    socket.leave(data);
    io.to(data).emit('someoneLeft');
    socket.emit('leaveResponse');
  });

  socket.on('requestRefresh', function() {
    socket.emit('refreshResponse');
  });

  socket.on('disconnect', function() {
    console.log('disconnection')
    const i = users.indexOf(socket);
    users.splice(i, 1);
    names = names.filter(val => val.id !== socket.id);
    io.emit('userCount', users.length);
    io.emit('respondUsers', names);
  });
});

http.listen(process.env.PORT || 3000, function() {
  console.log('listening on port ' + (process.env.PORT || 3000));
});

