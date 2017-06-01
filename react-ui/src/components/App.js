import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; // connect props and actions to top component
import * as actionCreators from '../actions/actionCreators';
import React, { Component } from 'react';
//components
import Welcome from './Welcome';
import MainContainer from './containers/MainContainer';

export class App extends Component {
	constructor(props){
		super(props);
	}
  componentDidMount() {
    fetch('/api')
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        console.log(json);
      }).catch(e => {
        console.log(e);
      })
  }
	render() {
		return (
			<div>
				{this.props.user.user ? <MainContainer/> : <Welcome/> }
			</div>
		)
	}
}

function mapStateToProps(state){
	return{
		user:state.user
	}
}
function mapDispatchToProps(dispatch){
  return bindActionCreators(actionCreators,dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(App)