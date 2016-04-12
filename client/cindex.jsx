import io from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app'

const socket = io();
const reactRoot = window.document.getElementById('app');

//store state in window variables here since this is small. Larger app could use Redux
//or something for state management. I know it's bad practice, but again this is a small project
//and one of my aims is keeping dependencies to a minimum (as much as possible).
//in actuality this works similar to Redux because everything in the window is the "truth" or the store.

//a user has joined (just visited page, fires when the current user first joins also)
socket.on('userCount', function(data) {
  window.__userCount__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={data} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__}/>,
    reactRoot
  );
});

//a user has entered their name and wants to see other players
socket.on('respondUsers', function(data) {
  window.__gameNames__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={data} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__}/>,
    reactRoot
  );
});

//this user has entered their name and wants to see other players (and get username)
socket.on('respondUsername', function(data) {
  window.__userName__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={data}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__}/>,
    reactRoot
  );
});

//this user has been challenged
socket.on('challenged', function(data) {
  window.__challenged__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={data} challengeResponse={window.__challengeResponse__}
    gameRoom={window.__gameRoom__}/>,
    reactRoot
  );
});

//this user has received a reply to their challenge
socket.on('challengeResponse', function(data) {
  window.__challengeResponse__ = data;
  ReactDOM.render(
    <App socket={socket} userId={socket.id} names={window.__gameNames__} username={window.__userName__}
    userCount={window.__userCount__} challenged={window.__challenged__} challengeResponse={data}
    gameRoom={window.__gameRoom__}/>,
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
    gameRoom={data}/>,
    reactRoot
  );
});