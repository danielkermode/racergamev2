import React, { Component, PropTypes } from 'react';
import { Lobby } from './components/Lobby';
import { Help } from './components/Help';

export class App extends Component {
  static propTypes = {
    userCount: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      inLobby: false
    };
  }

  handleChange = (e) => {
    this.setState({ username: e.target.value });
  };

  onEnter = (e) => {
    if (e.keyCode === 13) {
      // 13 is enter
      this.goToLobby();
    }
  };

  goToLobby = () => {
    if(this.state.username) {
      this.props.socket.emit('requestUsers', this.state.username);
      this.setState({ inLobby: true })
    }
  };

  acceptChallenge = () => {
    this.props.socket.emit('meetChallenge', { me: this.props.username, answer: 'accept', name: this.props.challenged });
  };

  declineChallenge = () => {
    this.props.socket.emit('meetChallenge', { me: this.props.username, answer: 'decline', name: this.props.challenged });
  };

  playWithSelf = () => {
    this.props.socket.emit('playWithSelf', { me: this.props.username });
  };

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <div>
        <h1>Racecar Game</h1>
        <br/>
        {!this.props.username &&
          <div>
          Welcome! Who are you?
          <hr/>
          </div>
        }
        </div>

      {/* USERNAME ONCE LOGGED IN */
        this.props.username &&
        <div>
          <div>
          Your Username: <b>{this.props.username}</b>
          </div>
          <div style={{ fontSize: '80%' }}>
          (Please note that refreshing or closing the window will log you out, this is just a "by session" game)
          </div>
          <hr/>
        </div>
      }

      {/* CHALLENGED NOTIFICATION */
        this.props.challenged &&
        <div>
          {this.props.challenged !== this.props.username?
          <div>
            <div>You've been challenged by "{this.props.challenged}"!</div>
            <button onClick={this.acceptChallenge}> Accept </button>
          </div> :
          <div>
            <div>So you want to play with yourself, huh? (Maybe no one's around, I won't judge)</div>
            <button onClick={this.playWithSelf}> Accept </button>
          </div>
          }
          <br/>
          <button onClick={this.declineChallenge}> Decline </button>
          <hr/>
        </div>
      }

      {/* INITIAL FORM LOGIN */
      !this.state.inLobby?
      <div>
        <br/>
        <input onKeyDown={this.onEnter} onChange={this.handleChange} type="text" placeholder="Enter your name" />
        <button onClick={this.goToLobby}>
         Login
        </button>
      </div> :

      /* LOBBY WHEN NOT CHALLENGED AND LOGGED IN */
      !this.props.challenged &&
      <div>
        <Lobby socket={this.props.socket} username={this.props.username} names={this.props.names}
        challengeResponse={this.props.challengeResponse}/>
      </div>
      }
    </div>
    );
  }
}