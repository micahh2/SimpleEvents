import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'
import request from 'superagent';
import * as _ from 'lodash';

const categories = { "Fun": 0, "Sad": 1, "Normal": 2, "Canceled": 3, };
let events = [];
const fetch = (r) => {
  request.get('/list').then((resp) => {
    events = resp.body;
    r();
  });
}

const store = {
  register(app) {
    this.app = app;
  },
  updateState() {
    this.app.setState(this.app.state);
  },
}


const EventSummary = React.createClass({
  render() {
    let ev = this.props.event;
    return <Link to={ `/event/${ev.id}` }>
      <h2>{ ev.title }</h2>
      <p>
        { ev.description }
        <br/><i>Created: { ev.createdAt }</i>
        <br/><i>Updated: { ev.updatedAt }</i>
      </p>
    </Link>  
  },
});

const NoMatch = React.createClass({
  render() {
    return <h2>Not Found :(</h2>
  },
});
   
const DetailView = React.createClass({
  deleteEvent() {
    let index = events.indexOf(this.state.event);
    events.splice(index, 1);
    request.post('/delete').send({id: this.state.event.id}).end();
    //browserHistory.push('/');
  },
  updateEvent(key, filter) {
    let dv = this; 
    return (e) => {
      let val = e.target.value;
      if(e.target.type === 'checkbox')
        val = e.target.checked;
      if(typeof filter === 'function')
        val = filter(e.target.value);
      this.state.event[key] = val;
      this.state.event.updatedAt = new Date();
      dv.setState(this.state);
      store.updateState();
      clearTimeout(this.queuedReq);
      this.queuedReq = setTimeout(() => {
        request.post('/update').send(this.state.event).end();
      }, 500);
    };
  },
  getInitialState() {
    let id = parseInt(this.props.params.id);
    let event = _.find(events, { id });
    return { event, }
  },
  render() {
    let ev = this.state.event;
    let radio = [];
    for(let i of _.map(categories, (val, key) => { return { val, key }; })) {
      radio.push(<input 
          type="radio" 
          name="category" 
          checked={ ev.category === i.val } 
          onChange={ this.updateEvent('category', parseInt) } 
          value={ i.val }/>);
      radio.push(<label>{ i.key }</label>);
    }
    return <div>
      <input type="text" value={ ev.title } onChange={ this.updateEvent('title') }/>
      <br/><textarea value={ ev.description } onChange={ this.updateEvent('description') }></textarea>
      <br/><label>Start Date</label>
      <br/><input type="date" value={ ev.startDate } onChange={ this.updateEvent('startDate') }/>
      <br/><label>End Date</label>
      <br/><input type="date" value={ ev.endDate } onChange={ this.updateEvent('endDate') }/>
      <br/>{ radio }
      <br/><input type="checkbox" checked={ !!ev.featured } onChange={ this.updateEvent('featured') }/><label>Featured</label>
      <br/><Link to="/">Go Back</Link> | <Link to="/" onClick={ this.deleteEvent }>Delete Event</Link>
      <br/><i>Created: { ev.createdAt }</i>
      <br/><i>Updated: { ev.updatedAt }</i>
    </div>  
  },
});

const ListView = React.createClass({
  addEvent() {
    request.post('/add').then((resp) => {
      events.push(resp.body);
      store.updateState();
      browserHistory.push(`/event/${ resp.body.id }`);
      return false;
    });
  },
  getInitialState() {
    return { events };
  }, 
  render() {
    let rows = [];
    for (let event of this.state.events) {
      rows.push(<li>
        <EventSummary event={ event }/>
      </li>);
    }
    return <div>
             <ul> {rows} </ul>
             <a href="#addEvent" onClick={ this.addEvent }>Add Event</a>
           </div>
  },
});

const App = React.createClass({
  getInitialState() {
    return { events };
  },
  componentWillMount() {
    store.register(this);
  },
  render() { 
    let body = this.props.children;
    if(!body) 
      body = <ListView { ...this.props }/>

    return <div>
      <h1>Events</h1>
      { body }
    </div>
  },
});

const render = () => {
  ReactDOM.render(
      <Router history={ browserHistory }>
        <Route path="/" component={ App }>
          <Route path="event/:id" component={ DetailView }/>
          <Route path="*" component={ NoMatch }/>
        </Route>
      </Router>,
      document.getElementById('container'));
};

fetch(render);
