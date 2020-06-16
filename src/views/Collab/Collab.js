import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';
import Autosuggest from 'react-autosuggest';

import {
  Card,
  Table,
} from 'reactstrap';

// const tasks = client.service('tasks');

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
    console.log("Clicked ...");
    console.log(this.props);
    this.props.onFieldClicked(this.element, this, this.props.fieldDef);

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

  renderValue() {
    if (this.state.proposedValue) {
      if (this.props.fieldDef.type ==="person")
        return this.state.proposedValue.c_name_chn;
      else
        return this.state.proposedValue;
    } else {
      return this.props.value
    }
  }

  render() {
    if (this.state.editable) {
      
      return (
        <div className={!this.state.edited ? 'editable-col' : 'editable-col editable-col-edited'} id={this.props.id} onClick={this.handleEdit.bind(this)}>
          <label ref={this._saveRef.bind(this)} className='editable-field' id={"_f_" + this.props.id}>
            {this.renderValue()}
          </label>
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

class ReviewProposalModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
  }

  renderChanges() {

  }
  render() {
    return (
      <Modal isOpen={this.props.isOpen} className="modal-small" >
        <div className="modal-dialog " role="document">
          <div className="modal-content">

            <div className="container mt-3"><h4 className="float-left">Review Changes</h4>
              <div className="float-right">
                <button type="button" className="btn btn-light " data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
                  <svg className="bi bi-x" width="0.8em" height="0.8em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z" />
                    <path fillRule="evenodd" d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="modal-body ">
              {/* <p>Modal body text goes here.</p> */}
              <div className="container ">
                <div className="row">

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


            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

class ProposeValueModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: []
    };
  }

  handleChange(e) {
    // console.log("handleChange() new val");
    var val = e.target.value;

    if (val) {
      // console.log(val);
      this.setState({ value: val })
      if (val.trim() !== "")
        this.queryAndUpdate(val);
      else
        this.setState({ suggestions: [] });
    } else {
      this.setState({ value: "", suggestions: [] })
    }

  }

  cleanup() {
    
    this.setState({pick: null, value: "", suggestions: []});
    
  }

  handleCancel(e) {
    this.props.onClosed();
    this.cleanup();

  }

  handleSubmit(e) {
    // console.log("who ami ... handle submit");
    // console.log(this)
    var val;
    if (this.props.fieldDef.type === "person")
      val = this.state.pick;
    else
      val = this.state.value;

    this.props.onSubmit(val)
    var val = this.state.value;
    if (val) {
      this.setState({
        editText: val,
        editing: false,
      });
    }
    this.cleanup();

  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions(val) {
    // console.log("getSuggestions()");
    if (!val || val.trim() === "") {
      return [];
    }
    val = val.trim().toLowerCase();
    // console.log("Typing ... ");
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
        // console.log("Query result size: " + data.length);
        // if (data.length > 0)
        //   console.log(data[0]);
        // console.log(" -- end -- query  ");

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


    // console.log(thi)
    return (
      <Modal isOpen={this.props.isOpen} className="modal-small" style={{ overlay: { position: "absolute", right: "auto", bottom: "auto", top: this._absPos(this.props.currField).top, left: this._absPos(this.props.currField).left } }} >
        <div className="modal-dialog " role="document">

          <div className="modal-content">

            <div className="container mt-3">
              <h5 className="float-left">{this.renderTitle()}</h5>
              <div className="float-right">
                <button type="button" className="btn btn-light " data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
                  <svg className="bi bi-x" width="0.8em" height="0.8em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z" />
                    <path fillRule="evenodd" d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="modal-body ">
              <div className="container ">
                <div className="row">
                  <div className="float-left col ml-0 col-sm-8">{this.renderField()}</div>
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

  renderField() {
    if (this.props.fieldDef && this.props.fieldDef.type === "person") {
      return this.renderPersonField();
    } else {
      return this.renderRegularField();
    }


  }

  renderTitle() {
    // console.log(this.props.currField);
    if (this.props.fieldDef)
      return "Propose a new value (" + this.props.fieldDef.name + ")";

  }

  renderRegularField() {
    return (

      <div className="input-group">
        <input type="text" className="form-control"
          onSubmit={this.handleSubmit.bind(this)} onChange={this.handleChange.bind(this)}
          placeholder="Input a number or string" aria-label="Recipient's username with two button addons" aria-describedby="button-addon4">
        </input>
      </div>
    )
  }

  renderPersonField() {
    const renderSuggestion = suggestion => (
      <div>{suggestion.c_name_chn} ({suggestion.c_personid})</div>
    );
    const getSuggestionValue = suggestion => {
      // console.log(suggestion);
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
    const { suggestions } = this.state;
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested.bind(this)}
        onSuggestionsClearRequested={onSuggestionsClearRequested.bind(this)}
        onSuggestionSelected={onSuggestionSelected.bind(this)}
        getSuggestionValue={getSuggestionValue.bind(this)}
        renderSuggestion={renderSuggestion.bind(this)}
        inputProps={{ value: this.state.value, onSubmit: this.handleSubmit.bind(this), onChange: this.handleChange.bind(this) }}
      />
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
    const t = await this.props.client.service('tasks').get(1);
    this.state.tasks.push(t);
    // t.fields = new Map(t.fields);
    this.setState({ currentTask: t });
    this.setState(this.state);

    const fields = [];
    Object.entries(t.fields).forEach((field, index) => {
      fields.push(field[1]);
    });
    this.setState({ fields: fields });
    // console.log(this.state.fields);

  }

  onFieldClicked(element, editingField, fieldDef) {

    this.setState({
      currField: element, fieldDef: fieldDef,
      editingField: true, editingFieldComp: editingField,
    });

    this.windowOffset = window.scrollY;
    document.body.setAttribute('style', `position: fixed; top: -${this.windowOffset}px;left: 0;right:0`);
  }



  renderCurrTask() {
    if (!this.state.currentTask) {
      return null;
    }

    const data = Object.values(this.state.currentTask.data);
    return (
      <div className="">

        <div className="row">
          <div className="col">
            <button type="button" className="btn btn-primary float-right mb-3 " data-dismiss="modal" >
              <svg className="bi bi-cloud-upload mr-2" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.887 6.2l-.964-.165A2.5 2.5 0 1 0 3.5 11H6v1H3.5a3.5 3.5 0 1 1 .59-6.95 5.002 5.002 0 1 1 9.804 1.98A2.501 2.501 0 0 1 13.5 12H10v-1h3.5a1.5 1.5 0 0 0 .237-2.981L12.7 7.854l.216-1.028a4 4 0 1 0-7.843-1.587l-.185.96z" />
                <path fillRule="evenodd" d="M5 8.854a.5.5 0 0 0 .707 0L8 6.56l2.293 2.293A.5.5 0 1 0 11 8.146L8.354 5.5a.5.5 0 0 0-.708 0L5 8.146a.5.5 0 0 0 0 .708z" />
                <path fillRule="evenodd" d="M8 6a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8A.5.5 0 0 1 8 6z" />
              </svg>
          Submit Changes</button>
          </div>
        </div>
        <Card>
          <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
            <thead className="thead-light">
              <tr>
                {
                  (this.state.fields) && this.state.fields.map((field, index) => {

                    return (
                      <th key={"th_" + index}>{field.name}</th>
                    )
                  })
                }
              </tr>
            </thead>
            <tbody>
              {
                data.map((row, index) => {
                  if (index === 0)
                    return (null)
                  if (this.state.fields) {
                    // var fs = Object.entries(this.state.currentTask.fields);
                    // console.log(fs[5][1].input)
                  }

                  return (

                    <tr key={"_c_" + index}>
                      {row.map((field, vindex) => {
                        if (this.state.fields) {
                          // console.log("This fields ...");
                          // console.log(this.state.fields[vindex]);
                        }
                        return (
                          <td id={"td_c_" + index + "_" + vindex} key={"td_c_" + index + "_" + vindex}>
                            <EditableField fieldDef={this.state.fields ? this.state.fields[vindex] : null}
                              row={index} col={vindex} id={"_c_" + index + "_" + vindex}
                              onFieldClicked={this.onFieldClicked.bind(this)}
                              editable={(!this.state.fields) ? false : Object.entries(this.state.currentTask.fields)[vindex][1].input} value={field}>
                            </EditableField>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              }
            </tbody>
          </Table>

        </Card>
      </div>
    )
  }
  changeFieldMode() {

  }


  // Expecting a person object
  onSubmit(value) {
    var val = this.state.editingFieldComp.state.value;
    // console.log("Pre edit val: " + val);
    // console.log("Post edit val: " + person.c_name_chn);
    // console.log("Updating this component ...")
    // console.log(this.state.editingFieldComp);

    this.state.editingFieldComp.setState({ edited: true, proposedValue: value });
    this.onClosed();
  }

  onClosed() {
    this.setState({ editingField: false });
    document.body.setAttribute('style', '');
    // console.log(this.windowOffset);
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
        <ProposeValueModal isOpen={this.state.editingField}
          onSubmit={this.onSubmit.bind(this)}
          onClosed={this.onClosed.bind(this)}
          fieldDef={this.state.fieldDef}
          currField={this.state.currField}></ProposeValueModal>
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
