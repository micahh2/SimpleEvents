import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router';
import request from 'superagent';
import * as _ from 'lodash';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { List, ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// // http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const categories = { Fun: 0, Sad: 1, Normal: 2, Canceled: 3 };

// This object is the data store for the whole app
// It's a bit atrocious
let events = [];

const fetch = (r) => {
  request.get('/list').then((resp) => {
    events = resp.body;
    r();
  });
};

// Here we do a fun "register the app" thing b/c I was
// having trouble passing state through the Router
const store = {
  register(app) {
    this.app = app;
  },
  updateState() {
    this.app.setState(this.app.state);
  },
};


function EventSummary(props) {
  const ev = props.event;
  return (<Link to={`/event/${ev.id}`}>
    <h2>{ev.title}</h2>
    <p>
      {ev.description}
      <br /><i>Created: { ev.createdAt }</i>
      <br /><i>Updated: { ev.updatedAt }</i>
    </p>
  </Link>);
}
EventSummary.propTypes = {
  event: React.PropTypes.shape({
    id: React.PropTypes.number,
  }).isRequired,
};

function NoMatch() {
  return <h2>Not Found :(</h2>;
}

class DetailView extends React.Component {
  constructor(props) {
    super(props);
    const id = parseInt(props.params.id, 10);
    const event = _.find(events, { id });
    this.state = { event };
  }
  deleteEvent() {
    const index = events.indexOf(this.state.event);
    events.splice(index, 1);
    request.post('/delete').send({ id: this.state.event.id }).end();
  }
  updateEvent(key, filter) {
    const dv = this;
    return (e, otherValue) => {
      let val = otherValue;
      if (typeof val === 'undefined') {
        val = e.target.value;
        if (e.target.type === 'checkbox') {
          val = e.target.checked;
        }
        if (typeof filter === 'function') {
          val = filter(e.target.value);
        }
      }
      this.state.event[key] = val;
      this.state.event.updatedAt = new Date();
      dv.setState(this.state);
      store.updateState();
      clearTimeout(this.queuedReq);
      this.queuedReq = setTimeout(() => {
        request.post('/update').send(this.state.event).end();
      }, 500);
    };
  }
  render() {
    const ev = this.state.event;
    const radio = [];
    _.each(categories, (val, key) => {
      const buttonID = `cat${val}`;
      radio.push(<RadioButton id={buttonID} label={key} name="category" value={val} />);
    });
    return (<div>
      <TextField hintText="Title" value={ev.title} onChange={this.updateEvent('title')} />
      <br /><TextField hintText="Description" multiLine value={ev.description} onChange={this.updateEvent('description')} />
      <br /><DatePicker hintText="Start Date" autoOk value={ev.startDate} onChange={this.updateEvent('startDate')} />
      <br /><DatePicker hintText="End Date" autoOk value={ev.endDate} onChange={this.updateEvent('endDate')} />
      <br /><RadioButtonGroup defaultSelected={ev.category} onChange={this.updateEvent('category', parseInt)}>{ radio }</RadioButtonGroup>
      <br /><Checkbox label="Featured" checked={!!ev.featured} onCheck={this.updateEvent('featured')} />
      <br />
      <FlatButton onClick={() => browserHistory.push('/')} label="Go Back" />
      <span> | </span>
      <FlatButton onClick={this.deleteEvent} label="Delete Event" secondary />
      <br /><i>Created: {ev.createdAt}</i>
      <br /><i>Updated: {ev.updatedAt}</i>
    </div>);
  }
}
DetailView.propTypes = {
  params: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
  }).isRequired,
};

class ListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = { events };
  }
  addEvent() {
    request.post('/add').then((resp) => {
      events.push(resp.body);
      store.updateState();
      browserHistory.push(`/event/${resp.body.id}`);
      return false;
    });
  }
  render() {
    const rows = _.map(this.state.events,
      ev => <ListItem><EventSummary event={ev} /></ListItem>,
    );
    return (<div>
      <List> {rows} </List>
      <a href="#addEvent" onClick={this.addEvent}>Add Event</a>
    </div>);
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { events };
  }
  componentDidMount() {
    store.register(this);
  }
  render() {
    let body = this.props.children;
    if (!body) {
      body = <ListView {...this.props} />;
    }

    return (<div>
      <h1>Events</h1>
      { body }
    </div>);
  }
}
App.propTypes = {
  children: React.PropTypes.arrayOf(
                React.PropTypes.instanceOf(React.Component)),
};

const render = () => {
  ReactDOM.render(
    <MuiThemeProvider>
      <Router history={browserHistory}>
        <Route path="/" component={App}>
          <Route path="event/:id" component={DetailView} />
          <Route path="*" component={NoMatch} />
        </Route>
      </Router>
    </MuiThemeProvider>,
    document.getElementById('container'));
};

fetch(render);
