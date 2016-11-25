const React = require('react');
const ReactDOM = require('react-dom');
const request = require('superagent');
const promise = require('redux-promise-middleware');
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';

const getInitialState = function () {
  return { 
    events: [],
    isFetching: false,
    lastFetched: null,
    error:null,
  };
}

const reduce = (state = getInitialState(), action) => {
  switch(action.type) {
    case "FETCH_EVENTS_PENDING":
      return {...state, isFetching:true, events:reduceEvents(state.events, };
    case "FETCH_EVENTS_FULFILLED":
      return {...state, isFetching:false, lastFetched: new Date(), events: action.payload,};
    case "FETCH_EVENTS_REJECTED":
      return {...state, isFetching:false, error: action.payload,};
  }
  return {...state,};
}

const reduceEvents = (state = [], action) => {
  switch(action.type) {
    case 'ADD':
    case 'REMOVE':
      throw 'Not Implemented';
      break;
    default:
      return state;
  }
}

applyMiddleware(promise());
const store = createStore(reduce, );
const render = () => {
  ReactDOM.render(
    <Provider store={store}>
      <div>
        Hello World! {store.isFetching}
      </div>
    </Provider>,
    document.getElementById('container'));
}

store.subscribe(render);
render();
