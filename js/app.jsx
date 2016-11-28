import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router';
import request from 'superagent';
import * as _ from 'lodash';

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

// You'll notice that I've not caught any errors, 
// I promise you that it tears me up a little bit inside
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
    return (e) => {
      let val = e.target.value;
      if (e.target.type === 'checkbox') {
        val = e.target.checked;
      }
      if (typeof filter === 'function') {
        val = filter(e.target.value);
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
      const id = `cat${val}`;
      radio.push(<input
        id
        type="radio"
        name="category"
        checked={ev.category === val}
        onChange={this.updateEvent('category', parseInt)}
        value={val}
      />);
      radio.push(<label htmlFor={id}>{key}</label>);
    });
    return (<div>
      <input type="text" value={ev.title} onChange={this.updateEvent('title')} />
      <br /><textarea value={ev.description} onChange={this.updateEvent('description')} />
      <br /><label htmlFor="start" >Start Date</label>
      <br /><input id="start" type="date" value={ev.startDate} onChange={this.updateEvent('startDate')} />
      <br /><label htmlFor="end">End Date</label>
      <br /><input id="end" type="date" value={ev.endDate} onChange={this.updateEvent('endDate')} />
      <br />{ radio }
      <br /><input id="feat" type="checkbox" checked={!!ev.featured} onChange={this.updateEvent('featured')} />
      <label htmlFor="feat">Featured</label>
      <br />
      <Link to="/">Go Back</Link> | <Link to="/" onClick={this.deleteEvent}>Delete Event</Link>
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

// There's a bug in here I introduced at somepoint when
// I was refactoring. 
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
      ev => <li><EventSummary event={ev} /></li>,
    );
    return (<div>
      <ul> {rows} </ul>
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
    <Router history={browserHistory}>
      <Route path="/" component={App}>
        <Route path="event/:id" component={DetailView} />
        <Route path="*" component={NoMatch} />
      </Route>
    </Router>,
    document.getElementById('container'));
};

fetch(render);
