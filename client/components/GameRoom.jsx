import React, { Component, PropTypes } from 'react';
import { loader } from './Loader';
import { randLetter } from '../../utils';

export class GameRoom extends Component {
  static propTypes = {

  };

  componentDidMount() {
    var iframe  = document.getElementById('gameiframe');
    iframe.focus();
    if(this.props.car === 'yellow') window.__singlePlayer__ = true;
    else if(this.props.car === 'red' || this.props.car === 'blue') {
      window.__multiPlayer__ = true;
      window.__car__ = this.props.car;
    }
    this.props.socket.emit('requestArrow');
  }

  componentWillUnmount() {
    //it took me longer than I'd like to admit to realise I had to remove the event listener.....
    //otherwise the component doesn't unmount properly.
    //window vars look ugly don't they. Storing state in the window actually proved to be fine.
    //Not very scalable, of course, but it kept things easier logic wise.
    window.__errer__ = undefined;
    window.__singlePlayer__ = undefined;
    window.__multiPlayer__ = undefined;
    window.__car__ = undefined;
    window.__arrow__ = undefined;
    window.__challengeResponse__ = undefined;
  }

  render() {
    this.props.socket.on('someoneLeft', function(data) {
      window.__errer__ = 'It seems your opponent has left the room.';
    });
    return (
      <div>
        {window.__errer__ && <div style={{color: 'red'}}>{window.__errer__}</div>}
        <div>
          You are the <b>{this.props.car}</b> car.
          {this.props.car === 'yellow' && <span> (Playing alone)</span>}
        </div>
        {this.props.winner &&
          <div className='animated jello'>
            <h3>{this.props.winner} has won!</h3>
          </div>
        }
        {!this.props.arrow?
          <div>
            Game will start in two seconds... Get ready!
            {loader()}
          </div> :
          <div>
          </div>
        }
        <hr/>
        <iframe id='gameiframe' height='540px' width='840px' src='game/index.html'></iframe>
      </div>
    );
  }
}
