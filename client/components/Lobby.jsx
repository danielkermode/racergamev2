import React, { Component, PropTypes } from 'react';
import { loader } from './Loader';
import NotificationSystem from 'react-notification-system';

export class Lobby extends Component {
  static propTypes = {
    names: PropTypes.array
  };

  _notificationSystem = null;

  constructor(props) {
    super(props);
    this.state = {
      challenging: false,
      index: 0
    };
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem;
  }

  componentWillReceiveProps(nextProps) {
    //challenge has been declined (by other player)
    if (nextProps.challengeResponse) {
      if(nextProps.challengeResponse.answer === 'decline' && this.state.challenging) {
        this.setState({ challenging: false, index: 0 });
        this._notificationSystem.addNotification({
          title: 'Declined',
          message: 'Your challenge got declined. Sorry.',
          level: 'error'
        });
        window.__challengeResponse__ = undefined;
        this.props.socket.emit('requestRefresh');
      }
      if(nextProps.challengeResponse.answer === 'rejectSelf') {
        window.__challengeResponse__ = undefined;
        this.props.socket.emit('requestRefresh');
      }
    }
  }

  challenge = (index) => {
    this.props.socket.emit('challenge', {
      challenged: this.props.names[index].name,
      challenger: this.props.username
    });
    this.props.socket.emit('requestRefresh');
    this.props.names[index].name !== this.props.username &&
    this.setState({ challenging: this.props.names[index].name, index });
  };

  cancelChallenge = (index) => {
    this.props.socket.emit('challenge', {
      challenged: this.props.names[index].name,
      challenger: undefined
    });
    this.setState({ challenging: false, index: 0 });
  };

  userInChallenge = () => {
    this._notificationSystem.addNotification({
      title: 'User in challenge',
      message: 'That user is already in a challenge.',
      level: 'info'
    });
  };

  render() {
    return (
      <div>
      <NotificationSystem ref="notificationSystem" />
      <h3>Lobby</h3>
      {this.state.challenging?
        <div>
          You are challenging {this.state.challenging}. Awaiting response...
          <br/>
          {loader()}
          <button className='btn btn-default' onClick={this.cancelChallenge.bind(this, this.state.index)}>Cancel challenge</button>
        </div> :
        <div>
          <div>
            <div>
            Click on a user to challenge them.
            </div>
            <div>
            {this.props.names && this.props.names.length} user{this.props.names && this.props.names.length > 1 && <span>s</span>}
            &nbsp;in the lobby right now.
            </div>
          </div>
          <hr/>
          <div className='well' style={{ marginRight: '25%', marginLeft: '25%' }}>
          {this.props.names && this.props.names.map((val, index) => {
              return <div key={index}><button
              className={val.inChallenge? 'btn btn-default active' : 'btn btn-default'}
              onClick={val.inChallenge? this.userInChallenge : this.challenge.bind(this, index)}>
                {val.name}
              </button></div>;
            })
          }
          </div>
        </div>
      }
      </div>
    );
  }
}