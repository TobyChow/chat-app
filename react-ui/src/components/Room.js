import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions/actionCreators';
//css
import { text, textHover, activeRoom } from '../css/roomContainer.js'
import io from 'socket.io-client';

const socket = io();

class Room extends Component {
  constructor(props) {
    super(props);
    this.handleRoomChange = this.handleRoomChange.bind(this);
  }

  handleRoomChange(e) {
    // only applies if clicking on a new room (not clicking the same room)
    if (this.props.roomName !== this.props.currRoom) {
      console.log(`switching to room ${this.props.roomName}`);
      // update local store and other clients of user joining room
      this.props.addUser(this.props.roomName, this.props.user.user, this.props.user._id);
      socket.emit('subscribe', { room: this.props.roomName, user: this.props.user.user, _id: this.props.user._id })
      //
      //update local store and other clients of user leaving room
      this.props.removeUser(this.props.currRoom, this.props.user._id);
      socket.emit('unsubscribe', { room: this.props.currRoom, _id: this.props.user._id })
      //
      this.props.updateCurrRoom(this.props.roomName) // change state of currRoom to clicked room name
    } else {
      console.log('already in same room');
    }
  }

  render() {
    const { roomName, id } = this.props;
    return (
          <div 
            onClick={this.handleRoomChange} 
            style={Object.assign(
              {} , 
              text,
              roomName === this.props.currRoom && activeRoom )} 
            key={id}>
            {roomName}
          </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    currRoom: state.currRoom,
    user: state.user
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)
