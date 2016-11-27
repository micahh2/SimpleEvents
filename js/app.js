import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Link, browserHistory } from 'react-router'
import request from 'superagent';
import * as _ from 'lodash';

const categories = { "Fun": 0, "Sad": 1, "Normal": 2, "Cancelled": 3, };
let events = [];
const fetch = (r) => {
  request.get('/list').then((resp) => {
    events = resp.body;
    r();
  });
}

const EventSummary = React.createClass({
  onClick(e) {
    console.log('Click!');
  },
  render() {
    let ev = this.props.event;
    return <div onClick={ this.onClick }>
      <h2>{ ev.title }</h2>
      <p>
        { ev.description }
        <br/><i>Created: { ev.createdAt }</i>
        <br/><i>Updated: { ev.createdAt }</i>
      </p>
    </div>  
  },
});

const NoMatch = React.createClass({
  render() {
    return <h2>Not Found :(</h2>
  },
});
    
const DetailView = React.createClass({
  getInitialState() {
    let id = parseInt(this.props.params.id);
    let event = _.find(events, { id });
    return {
      event: {...event}
    }
  },
  render() {
    let ev = this.state.event;
    let radio = [];
    for(let i of categories.map((val, key) => { return { val, key }; }))
      radio.push(<input type="radio" value="category" checked={ ev == i.key}>i.val</input>)

    return <div>
      <input type="text" value={ ev.title }/>
      <br/><textarea value={ ev.description | ""}></textarea>
      <br/><input type="button" value="Submit"/>
      <br/>{ radio }
      <br/><i>Created: { ev.createdAt }</i>
      <br/><i>Updated: { ev.createdAt }</i>
    </div>  
  },
});

const ListView = React.createClass({
  getInitialState() {
    return { events };
  }, 
  render() {
    let rows = [];
    for (let event of this.state.events) {
      rows.push(<li>
        <Link to={ `/event/${event.id}` }>
          <EventSummary event={ event }/>
        </Link>
      </li>);
    }
    return <ul> {rows} </ul>
  },
});

const App = React.createClass({
  render() { 
    let body = this.props.children;
    if(!body) 
      body = <ListView {...this.props}/>

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
          <Route path="*" component={NoMatch}/>
        </Route>
      </Router>,
      document.getElementById('container'));
}

fetch(render);
