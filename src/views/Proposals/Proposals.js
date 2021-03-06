import React, { Component, Fragment } from 'react';
import MultiField from "./MultiField.js";
import { Card, Dropdown } from 'react-bootstrap';
import { CheckCircleIcon, } from '@primer/octicons-react'

import {
  Table,
} from 'reactstrap';
import PickProposalModal from './PickProposal.js';
import ReviewProposalModal from './ReviewProposals.js';

class Proposals extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      myTask: null,
      affectedRows: {},
      affectedCols: {},
      reviewProposal: false,
      resetToggle: false,
      isLoading: true,
    };

  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  async componentWillMount() {
    if (!this.props.user) {
      var r = await this.props.auth();
      if (!r) return;
    }
    try {
      const tasks = await this.props.client.service('tasks').find({});
      this.setState({ tasks: tasks })
      if (tasks.length === 0)
        return;

      var taskId = tasks[0].id;
      const storedId = localStorage.getItem("myTask");
      if (storedId && this.taskIdExists(tasks, storedId)) {
        taskId = storedId;
      }

      this.loadTask(taskId);

    } catch (e) {
      if (e.name === "NotAuthenticated") {
        this.props.auth();
      }
      console.log(e);

    }
  }


  taskIdExists(tasks, id) {
    var exists = false;
    tasks.forEach((t) => {
      if (t.id == id) {
        exists = true;
      }
    })
    return exists;
  }

  switchTask(t) {
    this.setState({ myTask: t })
    const fields = [];
    Object.entries(t.fields).forEach((field, index) => {
      fields.push(field[1]);
    });
    this.setState({ myFields: fields });
  }

  // async taskChanged(id) {
  //   console.log("taskChanged!");
  //   console.log(id);
  //   const t = await this.props.client.service('tasks').get(id, { query: { proposals: "all", proposedOnly: "true", finalized: "false" } })
  //   console.log(t);
  //   this.switchTask(t);
  // }

  async loadTask(id, show) {
    const filters = { proposals: "all", proposedOnly: "true" };
    const toShow = show != null ? show: this.state.showCompleted;

    console.log("Load finalized task too? " + show);
    if (!toShow) {
      filters.finalized = "false";
    } else {
      filters.finalized = "true";
    }

    var myId = id != null ? id : this.state.myTask.id;
    console.log("loadTask() id=" + myId)
    console.log(myId);
    const t = await this.props.client.service('tasks').get(myId, { query: filters })

    console.log("New task loaded ...")
    console.log(t);
    this.switchTask(t);
  }


  onFieldClicked(element, editingFieldComp, fieldDef) {
    this.setState({
      currField: element, fieldDef: fieldDef,
      editingField: true, editingFieldComp: editingFieldComp,
    });
    this.setState({
      currFieldProposals: editingFieldComp.props.values
    });

    this.windowOffset = window.scrollY;
    document.body.setAttribute('style', `position: fixed; top: -${this.windowOffset}px;left: 0;right:0`);
  }


  async showCompleted(e) {
    // const filters = { finalized: this.state.showCompleted};

    const show = e.target.checked;
    console.log("Show? " + e.target.checked)
    this.setState({ showCompleted: show });

    this.loadTask(null, show);
  }




  renderTaskDropdown() {
    return (
      <div className="col">
        <select className="task-selector custom-select" id="inputGroupSelect01">
          {
            this.state.tasks.length == 0 ? (<option> None </option>) : ""
          }
          {
            this.state.tasks.map((task, index) => {
              return (
                <option key={"task_" + task.id} onClick={this.loadTask.bind(this, task.id)} >({task.id}) {task.title}
                </option>
              )
            })
          }
        </select>

      </div>
    )
  }

  _renderTaskProposals(data) {
    return (
      <div className="fixed-table">
        <table responsive className="table table-responsive  data-table table-outline mb-0 d-none d-sm-table">
          <thead className="">
            <tr>
              {
                (this.state.myFields) && this.state.myFields.map((field, index) => {
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
                const pk = this.state.myFields ? row[this.state.myTask.pkCol] : -1
                return (
                  <tr key={"_c_" + index}>
                    {row.map((origValue, vindex) => {
                      const style = this._hasProposals(pk, vindex) ? " hover-cell" : ""
                      return (
                        <td id={"td_c_" + index + "_" + vindex} key={"td_c_" + index + "_" + vindex} >
                          {this.renderMultiField(origValue, pk, index, vindex)}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>

    )

  }
  renderMyTask() {
    if (!this.state.myTask || !this.state.myTask.data) {
      return null;
    }
    const task = this.state.myTask;
    console.log(task);
    // console.log(task.proposals)
    const data = Object.values(task.data);

    // console.log(data);

    return (
      <div className="">

        <div className="row align-items-center justify-content-between mt-0 mb-2">

          <div className="col col-sm-auto">
            <div className="row align-items-center justify-items-end mb-1">
              {/* <div className="col col-sm-auto"><h4>Current Task: </h4></div> */}
              {this.renderTaskDropdown()}
              <p></p>

            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" value="" id="defaultCheck1" onClick={this.showCompleted.bind(this)} />
              <label className="form-check-label" htmlFor="defaultCheck1">
                Show reviewed proposals too
                  </label>
            </div>
          </div>


        </div>
        <div className="row align-items-center justify-content-between mt-0 mb-1">
          <div className="col col-sm-auto">


          </div>
          <div className="col col-sm-auto">
            <i>({Object.values(this.state.affectedRows).length} rows touched)</i>
          </div>
        </div>


        {(data.length === 0) ?
          (<div> (This task has no outstanding proposals. Try collect new proposals, or check out previously reviewed proposals.)</div>)
          : this._renderTaskProposals(data)
        }





      </div>
    )
  }
  changeFieldMode() {

  }


  _onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }


  _hasProposals(pk, vindex) {
    const task = this.state.myTask;
    if (!this.state.myTask || !this.state.myFields)
      return false;
    const fieldName = this.state.myFields[vindex].field_name;

    if (task.proposals.hasOwnProperty(pk) && task.proposals[pk].hasOwnProperty(fieldName))
      return true;
    else
      return false;
  }

  renderMultiField(origValue, pk, index, vindex) {
    var displayValue;
    if (!this.state.myFields) {
      return (<div></div>)
    }
    // console.log(pk);
    const task = this.state.myTask;
    // const proposals = Object.keys(task.proposals[pk]);
    const fieldName = this.state.myFields[vindex].field_name;
    // console.log(fieldName);

    var pValues = [];
    if (task.proposals.hasOwnProperty(pk) && task.proposals[pk].hasOwnProperty(fieldName))
      pValues = task.proposals[pk][fieldName];

    // console.log(pValues);

    // pValues = pValues.filter(this._onlyUnique);

    if (pValues.length > 0) {
      displayValue = <MultiField fieldDef={this.state.myFields ? this.state.myFields[vindex] : null}
        row={index} col={vindex} id={"_c_" + index + "_" + vindex}
        taskId={task.id}
        primaryKey={pk}
        origValue={origValue}
        resetToggle={this.state.resetToggle}
        onFieldClicked={this.onFieldClicked.bind(this)}

        values={pValues}>
      </MultiField>
    } else {
      displayValue = <div>{this.renderValue(origValue)}</div>
    }
    return displayValue;
  }

  renderValue(value) {
    if (value.hasOwnProperty("c_name_chn")) {
      return value.c_name_chn
    } else if (value.hasOwnProperty("c_name")) {
      return value.c_name
    }
    return value;

  }

  discardClicked(e) {
    this.setState({ affectedRows: {}, resetToggle: true });
    // this.setState({resetToggle: false})
  }

  reviewClicked(e) {
    // this.copyHeaders();
    this.setState({ reviewProposal: true })
  }

  // Upon a proposed value being accepted
  onProposalAccepted(value) {
    this.setState({ resetToggle: false })
    const comp = this.state.editingFieldComp;
    comp.setState({ acceptedValue: value });

    // Add affected row to the list
    const aRows = this.state.affectedRows;
    const pk = comp.props.primaryKey;
    const col = comp.props.col;
    const field = comp.props.fieldDef;
    const row = comp.props.row;
    const data = Object.values(this.state.myTask.data)[row];
    const fields = this.state.myFields;

    // Copy over the row if empty
    if (!aRows[pk]) {
      aRows[pk] = [];
      for (var i = 0; i < fields.length; i++) {
        aRows[pk][i] = {
          col: i,
          fieldDef: fields[i],
          value: data[i],
          edited: false
        }
      }
    }

    aRows[pk][col] = {
      col: col,
      value: value,
      fieldDef: field,
      edited: true
    }

    this.onFieldEditorClosed();
  }

  onFieldEditorClosed() {
    this.setState({ editingField: false });
    document.body.setAttribute('style', '');
    window.scrollTo(0, this.windowOffset);
    this.loadTask();
  }

  async onSubmit() {
    // Transform all affected rows into proper array for update
    const aRows = this.state.affectedRows;
    const pks = Object.keys(aRows);
    const rows = Object.values(aRows);

    const updated = {};
    for (var i = 0; i < pks.length; i++) {
      const d = [];
      for (var j = 0; j < rows[i].length; j++) {
        d[j] = rows[i][j].value;
      }
      updated[pks[i]] = d;
      // Flag it as edited
      updated[pks[i]]["_edited"] = true;
    }
    console.log(updated);
    const t = await this.props.client.service('tasks').update(this.state.myTask.id, updated);

    // Force refresh the table
    this.loadTask();
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
    const disable = (Object.values(this.state.affectedRows).length === 0) ? true : "";
    // console.log("Enabled: " + Object.values(this.state.affectedRows).length);
    // console.log("Enabled: " + disable);
    return (
      <div>
        <div></div>
        <div className="row justify-content-end no-gutters mt-3">
          <div className="col mr-2 col-sm-auto">
          </div>

          <div className="col mr-2 col-sm-auto float-right ">
            <button type="button" onClick={this.reviewClicked.bind(this)} className=" blob-btn  " data-dismiss="modal" >
              <CheckCircleIcon></CheckCircleIcon> &nbsp;
                Adopt Changes
                <span className="blob-btn__inner">
                <span className="blob-btn__blobs">
                  <span className="blob-btn__blob"></span>
                  <span className="blob-btn__blob"></span>
                  <span className="blob-btn__blob"></span>
                  <span className="blob-btn__blob"></span>
                </span>
              </span>
            </button>
            <button type="button" onClick={this.discardClicked.bind(this)} className="ml-2 blob-btn" data-dismiss="modal" >
              Discard </button>
          </div>


        </div>
        <Card className="app-card">

          <Card.Body>


            <div>
              {this.renderMyTask()}


            </div>

          </Card.Body>
        </Card>
      </div>
    )
  }
  render() {


    return (
      <Fragment>
        <PickProposalModal isOpen={this.state.editingField}
          onSubmit={this.onProposalAccepted.bind(this)}
          onClosed={this.onFieldEditorClosed.bind(this)}
          comp={this.state.editingFieldComp}
          fieldDef={this.state.fieldDef}
          client={this.props.client}
          acceptedValue={this.state.editingFieldComp ? this.state.editingFieldComp.state.acceptedValue : null}
          origValue={this.state.editingFieldComp ? this.state.editingFieldComp.props.origValue : null}
          currField={this.state.currField}></PickProposalModal>

        <ReviewProposalModal isOpen={this.state.reviewProposal}
          // cols={this.state.affectedCols}
          onClosed={this.onReviewClosed.bind(this)}
          userid={this.props.user ? this.props.user.id : -1}
          client={this.props.client}
          onSubmit={this.onSubmit.bind(this)}
          task={this.state.myTask}
          data={this.state.affectedRows}
        />

        <div>
          {(this.state.tasks.length == 0) ?
            (
              <Card className="mt-4 app-card">
                <Card.Body>
                  <div className="ml-2 mt-2 mb-2" > No tasks found. Try <a href="/#/import">import a new task</a>. </div>
                </Card.Body>
              </Card>
            ) : this.renderTasks()
          }
        </div>

      </Fragment >
    );
  }
}

export default Proposals;
