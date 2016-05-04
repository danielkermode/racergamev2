import React, { Component, PropTypes } from 'react';
import Modal from 'react-modal';

const customStyles = {
  content: {
    backgroundColor: 'white',
    padding: '0.1%'
  },
};


export class Help extends Component {
  static propTypes = {
    //no props, this component is just informative and takes no data from server or aanything
  };

  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false
    };
  }

  toggleModal = () => {
    this.setState({ modalOpen: !this.state.modalOpen });
  };

  render() {
    return (
      <div>
        <div>
          <button className='btn btn-primary' onClick={this.toggleModal}>About</button>
        </div>
        <Modal
          className="Modal__Bootstrap modal-dialog"
          closeTimeoutMS={150}
          isOpen={this.state.modalOpen}
          onRequestClose={this.toggleModal}
          style={customStyles}>
          <h2 style={{ textAlign: 'center' }}> About </h2>
          <div style={{ marginLeft: '20%', marginRight: '20%' }}>
            <p>This is a racecar game. Made mainly using Socket.io, React.js and Phaser.</p>
            <p><b>How it works:</b> Enter your name and you'll join a lobby with everyone else connected
            to the socket.io server. Click on someone's name to challenge
            them (if the button is indented, it means that they are already in a pending challenge).
            If they accept, you'll enter a game where you each have a racecar, and it's a
            battle of reactions to see who can make it to the finish.
            Dodge mines and collect stars. Stars take 300 points and mines give 300 (the aim is to get to 0
            first). Use the left and right arrow keys to move.</p>
            <p>You can also play in single player mode by challenging yourself if you're that way
            inclined (or no one else is online).</p>
            <p>If you'd like to see how it works with two players, open up two tabs and pit the
            two players against each other (each tab can be a new session). Or play with a friend
            on another computer of course!</p>
            <p>Code can be found <a href='https://github.com/danielkermode/racergamev2'>here.</a></p>
            <p style={{ textAlign: 'center' }}>
              <button className="btn btn-default" onClick={this.toggleModal}>I see</button>
            </p>
            <hr/>
            <footer style={{ fontSize: '85%' }}>
              <p>Author: Daniel Kermode</p>
              <p>Email: danielkermode@hotmail.co.nz</p>
              <p>Github: <a href='https://github.com/danielkermode'>github.com/danielkermode</a></p>
            </footer>
          </div>
        </Modal>
      </div>
    );
  }
}
