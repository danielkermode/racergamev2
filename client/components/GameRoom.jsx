import React, { Component, PropTypes } from 'react';
import { loader } from './Loader';
import io from 'socket.io-client';
import { randLetter } from '../../utils';

const speed = 5;
const finishLine = 83;
const roadStyle = {
  backgroundImage: 'url("/road.png")',
  backgroundRepeat: 'repeat-x'
};


export class GameRoom extends Component {
  static propTypes = {

  };

  constructor(props) {
    super(props);
    this.state = {
      distance: 0
    };
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keyLogic);
    if(!window.__blueCar__ && !window.__redCar__) {
      if(this.props.car === 'yellow') {
        window.__yellowCar__ = '/yellowcar.png';
        this.forceUpdate();
      } else if(this.props.car === 'red' || this.props.car === 'blue') {
        window.__blueCar__ = '/bluecar.png';
        window.__redCar__ = '/redcar.png';
      }
    }
  }

  componentWillUnmount() {
    //it took me longer than I'd like to admit to realise I had to remove the event listener.....
    //otherwise the component doesn't unmount properly.
    //window vars look ugly don't they. Storing state in the window actually proved to be fine.
    //Not very scalable, of course, but it kept things easier logic wise.
    document.removeEventListener('keyup', this.keyLogic);
    window.__errer__ = undefined;
    window.__blueCar__ = undefined;
    window.__redCar__ = undefined;
    window.__yellowCar__ = undefined;
    window.__arrow__ = undefined;
  }

  keyLogic = (e) => {
    if(this.props.arrow === e.code.split('').pop() && !this.props.winner) {
      if(this.state.distance >= finishLine) {
        this.props.socket.emit('requestWinner', { room: this.props.gameRoom, winner: this.props.username });
        return;
      }
      this.setState({ distance: this.state.distance + speed });
      this.props.socket.emit('requestArrow', { room: this.props.gameRoom, distance: this.state.distance });
    }
  };

  render() {
    this.props.socket.on('someoneLeft', function(data) {
      window.__errer__ = 'It seems your opponent has left the room.';
    });
    return (
      <div onKeyDown={this.keyLogic}>
        {window.__errer__ && <div style={{color: 'red'}}>{window.__errer__}</div>}
        <div>
          You are the <b>{this.props.car}</b> car.
          {this.props.car === 'yellow' && <span> (Playing alone)</span>}
        </div>
        {this.props.winner && <div>{this.props.winner} has won!</div>}
        {!this.props.arrow?
          <div>
            Game will start in two seconds... Get ready!
            {loader()}
          </div> :
          <div>
          {this.props.arrow.length === 1? <span>Hit the "{this.props.arrow}" key!</span> :
          <span>{this.props.arrow}</span>}
          </div>
        }
        {window.__yellowCar__ &&
        <div className='row' style={roadStyle}>
          <img src={window.__yellowCar__} alt="yellowcar"
          style={{ marginLeft: this.state.distance + '%' }} className="img-responsive" />
        </div>}
        <br/>
        {window.__blueCar__ &&
        <div className='row' style={roadStyle}>
          <img src={window.__blueCar__} alt="bluecar"
          style={{ marginLeft: this.props.car === 'blue'? this.state.distance + '%' : this.props.enemyDistance + '%' }}
          className="img-responsive" />
        </div>}
        <br/>
        {window.__redCar__ &&
        <div className='row' style={roadStyle}>
          <img src={window.__redCar__} alt="redcar"
          style={{ marginLeft: this.props.car === 'red'? this.state.distance + '%' : this.props.enemyDistance + '%' }}
          className="img-responsive" />
        </div>}
      </div>
    );
  }
}
