import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../actions/actionCreators';
//components
import Messages from '../Messages';
import RoomContainer from './RoomContainer';
import Inputs from '../Inputs';
import Users from '../Users';
import test from '../test';

const mainContainer = {
  display:'flex',
  width:'100vw',
  height:'100vh',
}
import io from 'socket.io-client';
var socket = io();

class MainContainer extends Component {
  constructor(props) {
    super(props);
    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.handleRoomSubscribe = this.handleRoomSubscribe.bind(this);
    this.handleRoomUnsubscribe = this.handleRoomUnsubscribe.bind(this);
    this.handleUserDisconnect = this.handleUserDisconnect.bind(this);
  }

  componentDidMount() {
    this.handleRoomSubscribe()
    this.handleRoomUnsubscribe();
    this.handleUserDisconnect();
    this.handleIncomingMessage();
    this.props.getMessage({user:this.props.user.user, _id:this.props.user._id});
  }

  handleIncomingMessage() {
    socket.on('client msg', (msg) => {
      const { room, user, message } = msg;
      console.log('firing postmessage');
      this.props.postMessage(room, user, message); // ONLY update state when receiving message
    })
  }

  handleRoomSubscribe(){
    socket.on('subscribe', (data) => {
      console.log(`adding user ${data.user} to ${data.room}`);
      this.props.addUser(data.room, data.user, data._id)
    })
    // add user to local state room's users array
    socket.emit('subscribe', {room:'general', user:this.props.user.user, _id:this.props.user._id})
  }

  handleUserDisconnect(){
    socket.on('user disconnect', (_id) => {
      console.log(`${_id} has disconnected`);
      /* messy hack to find room disconnected user was in to update state and db, 
      since we can't pass data on disconnect socket evt */
      let matchedRoom = this.props.rooms.filter((room) => {
        return room.users.some((user) => {
          return user._id === _id;
        })
      })
      console.log(`disconnected user was in room ${matchedRoom[0].room}`);
      this.props.removeUser(matchedRoom[0].room , _id) // updates local state
      socket.emit('unsubscribe', { room:matchedRoom[0].room, _id }) //updates db
    })
  }

  handleRoomUnsubscribe(){
    socket.on('unsubscribe', (data) => {
      console.log(`removing user ${data._id} from ${data.room}`);
      this.props.removeUser(data.room, data._id)
    })
  }

  // room data passed depends on state of 'currRoom'
  render() {
    const { rooms, currRoom } = this.props;
    const matchedRoom = rooms.find((room) => {
      return room.room === currRoom;
    })
    if (!matchedRoom) {
      return (<p>Loading</p>)  // replace with loading icon
    }
    return (
      <div style={mainContainer}>
        <RoomContainer socket={socket}/>
        <Messages socket={socket} room={this.props.currRoom} messages={matchedRoom.messages}/>
        <Users users={matchedRoom.users}/>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
    rooms: state.rooms,
    currRoom: state.currRoom,
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer)
