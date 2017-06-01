import { createStore, compose, applyMiddleware } from 'redux';
import { syncHistoryWithStore} from 'react-router-redux';
import { browserHistory } from 'react-router';
import { createBrowserHistory } from 'history';
import axios from 'axios';
import thunk from 'redux-thunk'
// import the root reducer
import rootReducer from './reducers/index';

// import test data
import rooms from './data/rooms.js'

// create an object for the default data
const defaultState = {
	rooms
};

// for redux dev tools
const enhancers = compose(
	window.devToolsExtension? window.devToolsExtension(): f=>f,
	applyMiddleware(thunk)
	);

// create store
const store = createStore(rootReducer, applyMiddleware(thunk));
window.store = store;
// save store history
export const history = syncHistoryWithStore(createBrowserHistory(), store);

// allows hot refresh for reducers as well
if(module.hot) {
  module.hot.accept('./reducers/',() => {
    const nextRootReducer = require('./reducers/index').default;
    store.replaceReducer(nextRootReducer);
  });
}

export default store;
