import React, { Component, Fragment } from 'react';
import ProposeValueModal from "./ProposeValue.js";
import ReviewProposalModal from "./ReviewProposal.js";
import EditableField from "./EditableField.js";
import { Card, Dropdown } from 'react-bootstrap';


import {
  // Card,
  Table,
} from 'reactstrap';

// const tasks = client.service('tasks');

class Collab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      currentTask: null,
      proposedValues: {},
      proposedFieldCols: {},
      reviewProposal: false,
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
    console.log(t);
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

  reviewProposal() {
    console.log("All fields touched ...");
    var rows = Object.entries(this.state.proposedValues);
    for (var i = 0; i < rows.length; i++) {
      var row = Object.entries(rows[i][1]);
      console.log(row);

      for (var j = 0; j < row.length; j++) {
        var f = row[j];
        console.log(" -- " + f[1].props.fieldDef.name + ": " + f[1].state.proposedValue);
      }

    }
  }


  discardClicked(e) {
    this.setState({ proposedValues: {} });
  }

  reviewClicked(e) {
    this.setState({ reviewProposal: true })
  }

  renderCurrTask() {
    if (!this.state.currentTask) {
      return null;
    }

    const data = Object.values(this.state.currentTask.data);
    return (
      <div className="">

        <div className="row align-items-center justify-content-between mt-0 mb-1">

          <div className="col col-sm-auto">
            <div className="row align-items-center justify-items-end mb-1">
              {/* <div className="col col-sm-auto"><h4>Current Task: </h4></div> */}
              <div className="col col-sm-auto">
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {this.state.tasks.length > 0 ? this.state.tasks[0].title : "<None>"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item >
                      {
                        this.state.tasks.map((task, index) => {
                          if (index === 0)
                            return;
                          return (
                            <a id={"task_" + index} className="dropdown-item" href="#">{index}. {task.title}</a>
                          )
                        })
                      }
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
          <div className="col col-sm-auto">
            <i>({Object.values(this.state.proposedValues).length} rows touched)</i>
          </div>

        </div>

        <Table hover responsive className="table-outline align-bottom mb-0 d-none d-sm-table">
          <thead className="thead-light">
            <tr>
              {
                (this.state.fields) && this.state.fields.map((field, index) => {
                  // console.log(field);
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
                // console.log(row);

                return (

                  <tr key={"_c_" + index}>
                    {row.map((field, vindex) => {
                      if (this.state.fields) {
                        // console.log("This fields ...");
                        // console.log(this.state.fields[vindex]);
                      }
                      return (
                        <td id={"td_c_" + index + "_" + vindex} key={"td_c_" + index + "_" + vindex} className="td-bottom">
                          <EditableField fieldDef={this.state.fields ? this.state.fields[vindex] : null}
                            row={index} col={vindex} id={"_c_" + index + "_" + vindex}
                            primaryKey={this.state.fields ? row[this.state.currentTask.pkCol] : -1}
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

      </div>
    )
  }
  changeFieldMode() {

  }


  // Expecting a person object
  onFieldEdited(value) {
    var comp = this.state.editingFieldComp;
    var proposed = this.state.proposedValues
    this.state.editingFieldComp.setState({ edited: true, proposedValue: value });
    if (!proposed[comp.props.primaryKey])
      proposed[comp.props.primaryKey] = {};
    proposed[comp.props.primaryKey][comp.props.col] = {
      col: comp.props.col,
      value: value,
      fieldDef: comp.props.fieldDef,
      edited: true
    }

    // HACKY: Standard headers
    const data = Object.values(this.state.currentTask.data)[comp.props.row];

    // console.log(Object.values(this.state.currentTask.data));

    var fieldCols = this.state.proposedFieldCols;
    fieldCols[comp.props.col] = comp.props.fieldDef;
    fieldCols[comp.props.col].col = comp.props.col;

    for (var i = 0; i < 4; i++) {
      fieldCols[i] = this.state.fields[i];
      fieldCols[i].col = i;
      proposed[comp.props.primaryKey][i] = {
        col: i,
        // row: comp.props.row,
        fieldDef: this.state.fields[i],
        value: data[i],
        edited: false
      }
    }
    console.log(proposed[comp.props.primaryKey]);

    this.onFieldEditorClosed();
  }

  onFieldEditorClosed() {
    this.setState({ editingField: false });
    document.body.setAttribute('style', '');
    window.scrollTo(0, this.windowOffset);
  }

  onReviewClosed() {
    this.setState({ reviewProposal: false });
    document.body.setAttribute('style', '');
    window.scrollTo(0, this.windowOffset);
  }
  renderTasks() {
    // console.log(this.state.tasks);
    this.state.tasks.forEach((task, index) => {
      // console.log("hi");
      // return console.log(task);
    });
    return (

      <div>

        <div></div>
        <div className="row justify-content-end no-gutters mt-3">
          <div className="col mr-2 col-sm-auto">

          </div>
          <div className="col mr-2 col-sm-auto float-right">
            <button type="button" onClick={this.reviewClicked.bind(this)} className="btn mr-2 col col-sm-auto btn-primary float-right mb-3 " data-dismiss="modal" >
              <svg className="bi bi-cloud-upload mr-2" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.887 6.2l-.964-.165A2.5 2.5 0 1 0 3.5 11H6v1H3.5a3.5 3.5 0 1 1 .59-6.95 5.002 5.002 0 1 1 9.804 1.98A2.501 2.501 0 0 1 13.5 12H10v-1h3.5a1.5 1.5 0 0 0 .237-2.981L12.7 7.854l.216-1.028a4 4 0 1 0-7.843-1.587l-.185.96z" />
                <path fillRule="evenodd" d="M5 8.854a.5.5 0 0 0 .707 0L8 6.56l2.293 2.293A.5.5 0 1 0 11 8.146L8.354 5.5a.5.5 0 0 0-.708 0L5 8.146a.5.5 0 0 0 0 .708z" />
                <path fillRule="evenodd" d="M8 6a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8A.5.5 0 0 1 8 6z" />
              </svg>
          Submit Changes</button>
          </div>
          <div className="col col-sm-auto float-right">


            <button type="button" onClick={this.discardClicked.bind(this)} className="btn col col-sm-auto  btn-warning float-right mb-3 " data-dismiss="modal" >
              <svg width="1em" height="1em" viewBox="0 0 16 16" className="mr-2 bi bi-x-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.146-3.146a.5.5 0 0 0-.708-.708L8 7.293 4.854 4.146a.5.5 0 1 0-.708.708L7.293 8l-3.147 3.146a.5.5 0 0 0 .708.708L8 8.707l3.146 3.147a.5.5 0 0 0 .708-.708L8.707 8l3.147-3.146z" />
              </svg>
          Discard </button>
          </div>
        </div>
        <Card>

          <Card.Body>

            <hl></hl>


            <div>

              {this.renderCurrTask()}
            </div>

          </Card.Body>
        </Card>
      </div>
    )
  }
  render() {


    return (
      <Fragment>
        <ProposeValueModal isOpen={this.state.editingField}
          onSubmit={this.onFieldEdited.bind(this)}
          onClosed={this.onFieldEditorClosed.bind(this)}
          fieldDef={this.state.fieldDef}
          currField={this.state.currField}></ProposeValueModal>
        <ReviewProposalModal isOpen={this.state.reviewProposal}
          cols={this.state.proposedFieldCols}
          onClosed={this.onReviewClosed.bind(this)}
          userid={this.props.user ? this.props.user.id : -1}
          client={this.props.client}
          task={this.state.currentTask}
          data={this.state.proposedValues}
        />
        {/* // onSubmit={this.onFieldEdited.bind(this)}
          // onClosed={this.onFieldEditorClosed.bind(this)}
          // fieldDef={this.state.fieldDef}} */}
        <div>
          {this.renderTasks()}
        </div>


      </Fragment >
    );
  }
}

export default Collab;
