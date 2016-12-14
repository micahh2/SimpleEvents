import * as _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import { Router, browserHistory } from 'react-router';
import request from 'superagent';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ListView from './components/ListView.jsx';
import DetailView from './components/DetailView.jsx';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

function getDefaultState() {
  return { events: [], isLoading: true, isSaving: false };
}

function eventsReducer(state = getDefaultState(), action) {
  switch (action.type) {
    case 'ADD_EVENT':
      return { ...state, isLoading: true };
    case 'REMOVE_EVENT':
      return { ...state, events: state.events.filter(t => t.id !== action.id) };
    case 'UPDATE_EVENT':
      console.log("Updating Event: ", action.key, ", ", action.val);
      return {
        ...state,
        events: state.events.map((t) => {
          if (action.id === t.id) {
            const newEvent = { ...t };
            newEvent[action.key] = action.val;
            return newEvent;
          }
          return t;
        }) };
    case 'LOAD_EVENT':
      return { ...state, events: state.events.concat(action.event), isLoading: false };
    case 'LOAD_EVENTS':
      return { ...state, events: action.events, isLoading: false};
    default:
      return state;
  }
};

const store = createStore(combineReducers({
  eventState: eventsReducer,
}));

function NoMatch() {
  return <h2>Not Found :(</h2>;
}

function App(props) {
  let body = props.children;
  if (!body) {
    body = <ListView {...props} />;
  }

  return (<div>
    <h1>Events</h1>
    { body }
  </div>);
}
App.propTypes = {
  children: React.PropTypes.arrayOf(
    React.PropTypes.instanceOf(React.Component)),
};

const routes = {
  path: '/',
  component: App,
  childRoutes: [
    { path: 'event/:id', component: DetailView },
    { path: '*', component: NoMatch },
  ],
};

const render = () => {
  ReactDOM.render(
    <MuiThemeProvider>
      <Provider store={store}>
        <Router history={browserHistory} routes={routes} />
      </Provider>
    </MuiThemeProvider>,
    document.getElementById('container'));
};

store.subscribe(render);
render();

request.get('/list').then((resp) => {
  store.dispatch({ type: 'LOAD_EVENTS', events: resp.body });
});
