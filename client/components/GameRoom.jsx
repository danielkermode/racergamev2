import React, { Component, PropTypes } from 'react';
import io from 'socket.io-client';

//detect room events here
let socket;
if(socket && socket.on) {
  socket.on('hi', function(data) {
    console.log(data)
  });
}

export class GameRoom extends Component {
  static propTypes = {
    gameRoom: PropTypes.string,
  };

  componentDidMount() {
    //disconnect from the default room
    this.props.socket.disconnect();
    socket = io.connect(this.props.gameRoom, {
      query: 'ns='+this.props.gameRoom,
      resource: "socket.io"
    });
  }

  render() {
    return (
      <div>
        This is gamerrom. in room {this.props.gameRoom}
      </div>
    );
  }
}