import React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { List, ListItem } from 'material-ui/List';
import { Link, browserHistory } from 'react-router';
import request from 'superagent';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  events: state.eventState.events,
});

const mapDispatchToProps = dispatch => ({
  addEvent: () => {
    dispatch({ type: 'ADD_EVENT' });
    request.post('/add').then((resp) => {
      browserHistory.push(`/event/${resp.body.id}`);
      dispatch({ type: 'LOAD_EVENT', event: resp.body });
    });
  },
});

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

function ListView(props) {
  const rows = _.map(props.events,
    ev => <ListItem key={ev.id}><EventSummary event={ev} /></ListItem>,
  );
  return (<div>
    <List> {rows} </List>
    <a onClick={props.addEvent}>Add Event</a>
  </div>);
}
ListView.propTypes = {
  events: React.PropTypes.arrayOf(
    React.PropTypes.instanceOf(Object)),
  addEvent: React.PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ListView);
