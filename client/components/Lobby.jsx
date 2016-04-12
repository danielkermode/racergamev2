import React, { Component, PropTypes } from 'react';

export class Lobby extends Component {
  static propTypes = {
    names: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      challenging: false,
      index: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.challengeResponse) {
      if(nextProps.challengeResponse === 'accept') {
        this.props.socket.emit('requestRoom', { challenger: this.props.username, challenged: this.state.challenging });
      }
      this.setState({ challenging: false, index: 0 });
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
      <h3>Lobby</h3>
      {this.state.challenging?
        <div>
          You are challenging {this.state.challenging}. Awaiting response...
          <br/>
          <button onClick={this.cancelChallenge.bind(this, this.state.index)}>Cancel challenge</button>
        </div> :
        <div>
          <div>
          Click on a user to challenge them.
          </div>
          <div>
          Number of active users: {this.props.names && this.props.names.length}
          </div>
          <div>
          {this.props.names && this.props.names.map((val, index) => {
              return <div key={index}><button onClick={this.challenge.bind(this, index)}> {val.name} </button></div>;
            })
          }
          </div>
        </div>
      }
      </div>
    );
  }
}