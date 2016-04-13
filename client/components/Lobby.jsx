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
      if(nextProps.challengeResponse.answer === 'decline') {
        this.setState({ challenging: false, index: 0 });
        this._notificationSystem.addNotification({
          title: 'Hey',
          message: 'Your response got declined. Sorry.',
          level: 'info',
        });
        window.__challengeResponse__ = undefined;
      }
    }
  }

  challenge = (index) => {
    this.props.socket.emit('challenge', {
      challenged: this.props.names[index].name,
      challenger: this.props.username
    });
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
          <div className='well'>
            <div>
            Click on a user to challenge them.
            </div>
            <div>
            Number of active users: {this.props.names && this.props.names.length}
            </div>
          </div>
          <hr/>
          <div>
          {this.props.names && this.props.names.map((val, index) => {
              return <div key={index}><button className='btn btn-default' onClick={this.challenge.bind(this, index)}>
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