import React from 'react';
import { browserHistory } from 'react-router';
import * as _ from 'lodash';
import request from 'superagent';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { categories } from '../helpers/constants';

const mapStateToProps = (state, ownProps) => ({
  ...ownProps,
  event: state.eventState.events.find(t => parseInt(ownProps.params.id, 10) === t.id),
  isLoading: state.eventState.isLoading,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  deleteEvent: (id) => {
    request.post('/delete', { id }).then(() => {
      dispatch({ type: 'LOAD_DELETE' });
    });
    browserHistory.push('/');
    dispatch({ type: 'REMOVE_EVENT', id });
  },
  updateEvent: (key, filter) => (e, otherValue) => {
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
    dispatch({ type: 'UPDATE_EVENT', id: ownProps.params.id, key, val });
  },
  goHome: () => browserHistory.push('/'),
});

function DetailView(props) {
  const ev = props.event;
  if (props.isLoading) {
    return <div>Loading</div>;
  }
  const radio = [];
  _.each(categories, (t) => {
    const buttonID = `cat${t.value}`;
    radio.push(<RadioButton id={buttonID} label={t.title} name="category" value={t.value} />);
  });
  return (<div>
    <TextField hintText="Title" value={ev.title} onChange={props.updateEvent('title')} />
    <br /><TextField hintText="Description" multiLine value={ev.description} onChange={props.updateEvent('description')} />
    <br /><DatePicker hintText="Start Date" autoOk value={new Date(ev.startDate)} onChange={props.updateEvent('startDate')} />
    <br /><DatePicker hintText="End Date" autoOk value={new Date(ev.endDate)} onChange={props.updateEvent('endDate')} />
    <br /><RadioButtonGroup name="Category" defaultSelected={ev.category} onChange={props.updateEvent('category', parseInt)}>{ radio }</RadioButtonGroup>
    <br /><Checkbox label="Featured" checked={!!ev.featured} onCheck={props.updateEvent('featured')} />
    <br />
    <FlatButton onClick={props.goHome} label="Go Back" />
    <span> | </span>
    <FlatButton onClick={() => props.deleteEvent(ev.id)} label="Delete Event" secondary />
    <br /><i>Created: {ev.createdAt}</i>
    <br /><i>Updated: {ev.updatedAt}</i>
  </div>);
}
DetailView.propTypes = {
  deleteEvent: React.PropTypes.func,
  updateEvent: React.PropTypes.func,
  goHome: React.PropTypes.func,
  event: React.PropTypes.instanceOf(Object),
  isLoading: React.PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailView);
