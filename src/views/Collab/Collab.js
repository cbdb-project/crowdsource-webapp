import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';
import Autosuggest from 'react-autosuggest';

import {
  Card,
  Table,
} from 'reactstrap';
import Button from 'reactstrap/lib/Button';
import CardHeader from 'reactstrap/lib/CardHeader';
import CardBody from 'reactstrap/lib/CardBody';
// import Badge from 'reactstrap/lib/Badge';
import Circos from 'circos';
import * as _ from 'lodash';
import auth from '@feathersjs/authentication-client'


import BSN from 'bootstrap.native'

const io = require('socket.io-client');
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');

const socket = io('http://localhost:5000');
const client = feathers();

client.configure(socketio(socket));

const tasks = client.service('tasks');

class EditableField extends Component {
  constructor(props) {
    super(props);
    this.ESCAPE_KEY = 27;
    this.ENTER_KEY = 13;
    // console.log("Editable: " + props.editable);
    this.state = {
      editText: props.value,
      editable: props.editable,
      editing: false
    };
    this.element = {};
  }
  componentWillReceiveProps(newProps) {
    this.setState({ editable: newProps.editable })
  }

  handleEdit(e) {

    // // var myModalInstance = new BSN.Modal("#person-picker", {
    // //   backdrop: 'static',
    // // });


    // myModalInstance.show();
    this.props.onFieldClicked(this.element, this);

    return (e) => {
      this.setState({
        editing: !this.state.editing
      })
    };
  }


  _saveRef(el) {
    // el can be null - see https://reactjs.org/docs/refs-and-the-dom.html#caveats-with-callback-refs
    if (!el) return;

    // console.log(el.getBoundingClientRect()); // prints 200px
    this.element = el;
  }

  render() {
    if (this.state.editable) {
      return (
        <div className={!this.state.edited ? 'editable-col' : 'editable-col editable-col-edited'} id={this.props.id} onClick={this.handleEdit.bind(this)}>
          <label ref={this._saveRef.bind(this)} className='editable-field' id={"_f_" + this.props.id}>{this.state.proposedValue ? this.state.proposedValue : this.props.value}</label>
        </div>
      )
    } else {
      return (
        <div>
          {
            <label>{this.props.value}</label>
          }

        </div>
      )
    }
  }
}

class PersonPickerModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: []
    };
  }

  handleChange(e) {
    console.log("handleChange() new val");
    var val = e.target.value;

    if (val) {
      console.log(val);
      this.setState({ value: val })
      if (val.trim() !== "")
        this.queryAndUpdate(val);
      else
        this.setState({ suggestions: [] });
    } else {
      this.setState({ value: "", suggestions: [] })
    }

  }

  handleCancel(e) {
    this.props.onPickerClosed();
  }

  handleSubmit(e) {
    // console.log("who ami ... handle submit");
    // console.log(this)
    this.props.onPickerSubmit(this.state.pick)
    var val = this.state.value;
    if (val) {
      this.setState({
        editText: val,
        editing: false,
      });
    }

  }



  // handleKeyDown(event) {
  //   if (event.which === this.ESCAPE_KEY) {
  //     this.setState({
  //       editText: this.props.name,
  //       editing: false
  //     });
  //   } else if (event.which === this.ENTER_KEY) {
  //     this.handleSubmit(event);
  //   }
  // }



  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions(val) {
    console.log("getSuggestions()");
    if (!val || val.trim() === "") {
      return [];
    }
    val = val.trim().toLowerCase();
    console.log("Typing ... ");
    this.queryAndUpdate(val);
    return this.state.suggestions;
  }


  queryAndUpdate(q) {
    this.setState({ isLoading: true });
    fetch('http://localhost:5000/people?q=' + q)
      .then(res => res.json())
      .then((data) => {
        this.setState({ isLoading: false })

        this.setState({ suggestions: data })
        if (data == null) {
          this.setState({ suggestions: [] })
        }
        console.log("Query result size: " + data.length);
        if (data.length > 0)
          console.log(data[0]);
        console.log(" -- end -- query  ");

      })
      .catch((e) => {
        console.log(e);
        this.setState({ suggestions: [] });

      });
  }


  searchTyping(e) {

  }

  _absPos(element) {
    if (!element)
      return { top: 0, left: 0 };
    // console.log ("Element rel offset: " + element.offsetTop + " : " + element.offsetLeft);
    var top = 0, left = 0;
    var el = element;
    do {
      top += element.offsetTop || 0;
      left += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    // console.log(el);
    top -= el.offsetHeight;


    // console.log ("Element abs offset top / left: " + top + " : " + left);

    return {
      top: top,
      left: left
    };
  };



  render() {



    var left = 0;

    // Use your imagination to render suggestions.
    const renderSuggestion = suggestion => (
      <div>{suggestion.c_name_chn} ({suggestion.c_personid})</div>
    );
    const getSuggestionValue = suggestion => {
      console.log(suggestion);
      return suggestion.c_personid;
    }

    const onSuggestionSelected = (evt, props) => {

      this.setState({
        value: props.suggestion.c_name_chn,
        pick: props.suggestion
      });
    }


    const onSuggestionsFetchRequested = ({ value }) => {
      this.setState({
        suggestions: this.getSuggestions(value)
      });
    };

    const onSuggestionsClearRequested = () => {
      this.setState({
        suggestions: []
      });
    };
    const { value, suggestions } = this.state;



    return (

      <Modal isOpen={this.props.isOpen} className="modal-small" style={{ overlay: { position: "absolute", right: "auto", bottom: "auto", top: this._absPos(this.props.currField).top, left: this._absPos(this.props.currField).left } }} >
        <div className="modal-dialog " role="document">

          <div className="modal-content">
            {/* <div className="modal-header">
              <h5 className="modal-title">Choose a Person</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div> */}
            <div className="container mt-3"><h4 className="float-left">Propose a new person</h4>
              <div className="float-right">
                <button type="button" className="btn btn-light " data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
                  <svg className="bi bi-x" width="0.8em" height="0.8em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z" />
                    <path fillRule="evenodd" d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <hl></hl>
            <div className="modal-body ">
              {/* <p>Modal body text goes here.</p> */}
              <div className="container ">
                <div className="row">

                  {/* <input value={this.props.value} className="form-control input-block-level"
                      onChange={this.handleChange.bind(this)}
                      onKeyDown={this.handleKeyDown.bind(this)} /> */}
                  <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested.bind(this)}
                    onSuggestionsClearRequested={onSuggestionsClearRequested.bind(this)}
                    onSuggestionSelected={onSuggestionSelected.bind(this)}
                    getSuggestionValue={getSuggestionValue.bind(this)}
                    renderSuggestion={renderSuggestion.bind(this)}
                    inputProps={{ value: this.state.value, onSubmit: this.handleSubmit.bind(this), onChange: this.handleChange.bind(this) }}
                  />
                  <button type="button" className="ml-2 btn btn-primary" data-dismiss="modal" onClick={this.handleSubmit.bind(this)}>
                    {/* <span class="iconify" data-icon="bi-arrow-up-right-square-fill" data-inline="false"></span> */}
                    <svg className="bi bi-arrow-right-square" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                      <path fillRule="evenodd" d="M7.646 11.354a.5.5 0 0 1 0-.708L10.293 8 7.646 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0z" />
                      <path fillRule="evenodd" d="M4.5 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z" />
                    </svg>
                    <div className="float-right ml-2">Submit</div>
                  </button>

                </div>
              </div>

              {this.renderPersonInfo()}



            </div>
          </div>
        </div>
      </Modal>
    )
  }

  renderPersonInfo() {
    if (this.state.pick) {
      return (
        <div>
          <div className="modal-footer mt-3">
          </div>
          <div className="container">

            <div className="row">

              <b>{this.state.pick.c_name_chn} (id =  {this.state.pick.c_personid} )</b>

              <div>{this.state.pick.c_name} </div>
            </div>
            <p></p>
            <div className="row">

              {this.state.pick.c_birth_year}
              {this.state.pick.c_birth_nh}
            </div>
            <div className="row">
              <p>{this.state.pick.c_notes} </p>
            </div>
          </div>

        </div>

      )
    }
  }
}


class Collab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      currentTask: null,
      isLoading: true,
    };

  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  async componentWillMount() {
    console.log("auth-token content...");
    console.log(window.localStorage["auth-token"]);
    client.configure(
      auth({
        storage: window.localStorage,
        storageKey: 'auth-token',
        path: '/authentication'
      })
    )
    try {
      // First try to log in with an existing JWT
      console.log("reauth ...");
      console.log(await client.reAuthenticate());
      console.log("reauth done ...");
    } catch (error) {
      console.log("reauth failed! ...");
      console.log(error);

      this.props.history.push('/login')
      return;
    }

    const t = await client.service('tasks').get(1);
    this.state.tasks.push(t);
    // t.fields = new Map(t.fields);
    this.setState({ currentTask: t });
    this.setState(this.state);

    const fields = [];
    Object.entries(t.fields).forEach((field, index) => {
      fields.push(field[1].name);
    });
    this.setState({ fields: fields });
    // console.log(this.state.fields);
    console.log("will mount done ...");
  }

  onFieldClicked(element, editingField) {
    console.log("On field clicked ...");
    console.log(element);

    console.log(editingField);

    this.setState({ currField: element, editingField: true, editingFieldComp: editingField });
    this.windowOffset = window.scrollY;
    document.body.setAttribute('style', `position: fixed; top: -${this.windowOffset}px;left: 0;right:0`);
  }



  renderCurrTask() {
    if (!this.state.currentTask) {
      return null;
    }
    // console.log(this.state.currentTask);
    const data = Object.values(this.state.currentTask.data);
    return (
      <Card>
        <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
          <thead className="thead-light">
            <tr>
              {
                (this.state.fields) && this.state.fields.map((field, index) => {
                  // console.log(field);
                  return (
                    <th>{field}</th>
                  )
                })
              }
            </tr>
          </thead>
          <tbody>
            {
              data.map((row, index) => {
                if (index == 0)
                  return;
                var fs;
                if (this.state.fields) {
                  fs = Object.entries(this.state.currentTask.fields);
                  // console.log(fs[5][1].input)
                }

                return (
                  <tr key={"_c_" + index}>
                    {row.map((field, vindex) => {
                      return (
                        <td id={"td_c_" + index + "_" + vindex}><EditableField row={index} col={vindex} id={"_c_" + index + "_" + vindex} onFieldClicked={this.onFieldClicked.bind(this)} editable={(!this.state.fields) ? false : Object.entries(this.state.currentTask.fields)[vindex][1].input} value={field}></EditableField></td>
                      )
                    })}
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
      </Card>
    )
  }
  changeFieldMode() {

  }


  // Expecting a person object
  onPickerSubmit(person) {
    var val = this.state.editingFieldComp.state.value;
    console.log("Pre edit val: " + val);
    console.log("Post edit val: " + person.c_name_chn);
    console.log("Updating this component ...")
    console.log(this.state.editingFieldComp);
    this.state.editingFieldComp.setState({ edited: true, proposedValue: person.c_name_chn });
    this.onPickerClosed();
  }

  onPickerClosed() {
    this.setState({ editingField: false });
    document.body.setAttribute('style', '');
    console.log(this.windowOffset);
    window.scrollTo(0, this.windowOffset);
  }

  renderTasks() {
    // console.log(this.state.tasks);
    this.state.tasks.forEach((task, index) => {
      // console.log("hi");
      // return console.log(task);
    });
    return (

      <Card>
        <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
          <thead className="thead-light">
            <tr>
              <th>#</th>
              <th>Task</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {
              this.state.tasks.map((task, index) => {
                // console.log(task);
                return (
                  <tr key={index}>
                    <td>
                      <div>{index}</div>
                    </td>
                    <td><div>{task.title}</div></td>
                    <td><div>{task.status}</div></td>
                    <td><div>{task.created}</div></td>

                  </tr>
                )
              })
            }
          </tbody>
        </Table>
      </Card>
    )
  }
  render() {


    return (
      <Fragment>
        <PersonPickerModal isOpen={this.state.editingField} onPickerSubmit={this.onPickerSubmit.bind(this)} onPickerClosed={this.onPickerClosed.bind(this)} currField={this.state.currField}></PersonPickerModal>
        <div>
          {this.renderTasks()}
        </div>

        <div>
          {this.renderCurrTask()};
        </div>
      </Fragment >
    );
  }
}

export default Collab;
