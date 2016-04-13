import React, { Component, PropTypes } from 'react';
import { Lobby } from './components/Lobby';
import { Help } from './components/Help';
import { GameRoom } from './components/GameRoom';
import NotificationSystem from 'react-notification-system';

export class App extends Component {
  static propTypes = {
    userCount: PropTypes.number
  };

  _notificationSystem = null;

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      inLobby: false,
      inGame: false,
      car: undefined
    };
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  componentWillReceiveProps(nextProps) {
    //challenge has been accepted (by other player)
    if (nextProps.challengeResponse) {
      if(nextProps.challengeResponse.answer === 'accept') {
        this.props.socket.emit('requestRoom', {
          challenger: nextProps.challengeResponse.challenger.name,
          challenged: nextProps.challengeResponse.challenged.name
        });
        this.setState({ inLobby: false, inGame: true, car: 'blue' });
        window.__challengeResponse__ = false;
      }
    }
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
      this.setState({ inLobby: true });
      if(this.state.inGame) {
        this.props.socket.emit('leaveGame', this.props.gameRoom);
        this.setState({ inGame: false, car: undefined })
      }
    }
  };

  acceptChallenge = () => {
    this.props.socket.emit('meetChallenge', { challenged: this.props.username, answer: 'accept', challenger: this.props.challenged });
    this.setState({ inLobby: false, inGame: true, car: 'red' });
    this.props.socket.emit('requestRoom', { challenger: this.props.challenged, challenged: this.props.username });
  };

  declineChallenge = () => {
    this.props.socket.emit('meetChallenge', { challenged: this.props.username, answer: 'decline', challenger: this.props.challenged });
    if(this.props.challenged === this.props.username) {
      this._notificationSystem.addNotification({
        title: 'Hey',
        message: 'You rejected yourself.',
        level: 'info',
      });
    }
  };

  playWithSelf = () => {
    this.props.socket.emit('requestRoom', { challenger: this.props.username, challenged: this.props.username });
    this.setState({ inLobby: false, inGame: true, car: 'yellow' });
  };

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <NotificationSystem ref="notificationSystem" />
        <div>
        <h1>Racecar Game</h1>
        <Help/>
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
            <button className='btn btn-success' onClick={this.acceptChallenge}> Accept </button>
          </div> :
          <div>
            <div>So you want to play with yourself, huh? (Maybe no one's around, I won't judge)</div>
            <button className='btn btn-success' onClick={this.playWithSelf}> Accept </button>
          </div>
          }
          <br/>
          <button className='btn btn-danger' onClick={this.declineChallenge}> Decline </button>
          <hr/>
        </div>
      }

      {/* INITIAL FORM LOGIN */
      !this.state.inLobby && !this.state.inGame?
      <div>
        <br/>
        <input onKeyDown={this.onEnter} onChange={this.handleChange} type="text" placeholder="Enter your name" />
        <button className='btn btn-default' onClick={this.goToLobby}>
         Go
        </button>
      </div> :

      /* LOBBY WHEN NOT CHALLENGED AND LOGGED IN */
      !this.props.challenged && !this.state.inGame &&
      <div>
        <Lobby socket={this.props.socket} username={this.props.username} names={this.props.names}
        challengeResponse={this.props.challengeResponse}/>
      </div>
      }

      {/* IN GAME, SO NOT IN LOBBY AND NOT CHALLENGED */
        !this.props.challenged && !this.state.inLobby && this.state.inGame &&
        <div>
          <button className='btn btn-default' onClick={this.goToLobby}>Back to Lobby</button>
          <GameRoom arrow={this.props.arrow} gameRoom={this.props.gameRoom} winner={this.props.winner}
          car={this.state.car} socket={this.props.socket} username={this.props.username}
          enemyDistance={this.props.enemyDistance}/>
        </div>
      }
    </div>
    );
  }
}