//this method was easier (took it from socket.io docs) even though it's not es6
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const compress = require('compression');

//store state in a variable since this is a small app. If this was larger could use a database.
let users = [];
//names in a separate array because they could differ; a user may connect but not enter a name
//players in a game will be filtered from this names array.
let names = [];

//recursively check names to avoid conflicts (underscore will be added for each duplicate)
function checkName(names, name, id) {
  if(names.map(val => val.name).indexOf(name) > -1) {
    return checkName(names, name + '_', id);
  } else {
    names.push({ name, id });
    return name;
  }
}

app.use(compress());

app.get('/', function(req, res){
  res.sendFile(__dirname + '/client/public/index.html');
  //apparently needed for compression to affect server-sent events
  res.flush();
});

app.get('/phaser', function(req, res){
  res.sendFile(__dirname + '/client/phaser/index.html');
  //apparently needed for compression to affect server-sent events
  res.flush();
});

//public dir served statically
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
    const challengerInd = names[names.findIndex(val => val.id === socket.id)];
    const challengedInd = names[names.findIndex(val => val.name === data.challenged)];

    if(challengerInd) challengerInd.inChallenge = true;
    if(challengedInd) challengedInd.inChallenge = true;

    if(!data.challenger) {
      data.challenger = { cancel: true };
      if(challengerInd) challengerInd.inChallenge = undefined;
      if(challengedInd) challengedInd.inChallenge = undefined;
    }
    if(challengedInd) io.to(challengedInd.id).emit('challenged', data.challenger);
    io.emit('respondUsers', names);
  });

  socket.on('meetChallenge', function(data) {
    const challengerInd = names[names.findIndex(val => val.name === data.challenger)];
    const challengedInd = names[names.findIndex(val => val.name === data.challenged)];

    if(challengerInd) challengerInd.inChallenge = undefined;
    if(challengedInd) challengedInd.inChallenge = undefined;
    io.emit('respondUsers', names);
    if(challengerInd) io.to(challengerInd.id).emit('challengeResponse', {
      answer: data.answer,
      challenged: challengedInd,
      challenger: challengerInd
    });
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
          //2 seconds until game start
          setTimeout(() => curSocket.emit('arrowResponse', true), 2000);
          names = names.filter(val => val.id !== curSocket.id);
          io.emit('respondUsers', names);
        }
      }
    }
  });

  socket.on('requestArrow', function() {
    setTimeout(() => socket.emit('arrowResponse', true), 2000);
  })

  socket.on('requestWinner', function(data) {
    //data will be the room, which we can just emit to giving both players the winner
    io.to(data.room).emit('winnerResponse', data.winner);
  });

  socket.on('playerPos', function(data) {
    //emit to all OTHER sockets in the room (player position)
    socket.broadcast.to(data.room).emit('enemyPos', data.pos);
  });

  socket.on('playerScore', function(data) {
    //emit to all OTHER sockets in the room (player score)
    socket.broadcast.to(data.room).emit('enemyScore', data.score);
  });

  socket.on('playerObj', function(data) {
    //emit to all OTHER sockets in the room (new object)
    socket.broadcast.to(data.room).emit('enemyObj', { obj: data.obj, type: data.type });
  });

  socket.on('playerBlur', function(data) {
    //emit to all OTHER sockets in the room (if player blurs)
    socket.broadcast.to(data.room).emit('enemyBlur');
  });

  socket.on('playerFocus', function(data) {
    //emit to all OTHER sockets in the room (if player blurs)
    socket.broadcast.to(data.room).emit('enemyFocus');
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

