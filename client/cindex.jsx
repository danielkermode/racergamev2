import io from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app'

const socket = io();
const reactRoot = document.getElementById('app');

//store state in window variables here since this is small. Larger app could use Redux
//or something for state management. Yes it's bad practice, but again this is a small project
//and one of my aims is keeping dependencies to a minimum (as much as possible).
//in actuality this works similar to Redux because everything in the window is the "truth" or the store.
//certainly this app would be difficult to scale, though. Refactoring would be necessary.

window.__enemyDistance__ = 1;

//a user has joined (just visited page, fires when the current user first joins also)
socket.on('userCount', function(data) {
  window.__userCount__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={data} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__} arrow={window.__arrow__} winner={window.__winner__} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//a user has entered their name and wants to see other players
socket.on('respondUsers', function(data) {
  window.__gameNames__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={data} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__} arrow={window.__arrow__} winner={window.__winner__} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//this user has entered their name and wants to see other players (and get username)
socket.on('respondUsername', function(data) {
  window.__userName__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={data}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__} arrow={window.__arrow__} winner={window.__winner__} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//this user has been challenged
socket.on('challenged', function(data) {
  window.__challenged__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={data} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__} arrow={window.__arrow__} winner={window.__winner__} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//this user has received a reply to their challenge
socket.on('challengeResponse', function(data) {
  window.__challengeResponse__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={data}
    gameRoom={window.__gameRoom__} arrow={window.__arrow__} winner={window.__winner__} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//this user received a reply to requesting a room (with an opponent or by themselves)
socket.on('roomResponse', function(data) {
  window.__gameRoom__ = data;
  window.__challenged__ = false;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={data} arrow={window.__arrow__} winner={window.__winner__} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//this user left a game room and returned to the lobby.
socket.on('leaveResponse', function() {
  window.__gameRoom__ = false;
  window.__winner__ = undefined;
  window.__enemyDistance__ = 1;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__} arrow={window.__arrow__} winner={window.__winner__} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//refresh the app with window props.
socket.on('refreshResponse', function() {
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__} arrow={window.__arrow__} winner={window.__winner__} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//a key has been seen from the server (for the player to click to advance their car)
socket.on('arrowResponse', function(data) {
  window.__arrow__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__} arrow={data} winner={window.__winner__} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//a winner has been determined in the game
socket.on('winnerResponse', function(data) {
  window.__winner__ = data;
  window.__arrow__ = 'Congratulations!';
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__} arrow={window.__arrow__} winner={data} enemyDistance={window.__enemyDistance__}/>,
    reactRoot
  );
});

//the enemy car has advanced.
socket.on('enemyDistance', function(data) {
  window.__enemyDistance__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__} arrow={window.__arrow__} winner={window.__winner__} enemyDistance={data}/>,
    reactRoot
  );
});