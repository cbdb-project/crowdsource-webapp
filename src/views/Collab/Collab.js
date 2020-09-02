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
class Paginate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: 1
    }
  }
  MAX = 10;

  async gotoPage(e) {
    // console.log(e);
    // console.log("Page value:" + e.target.value);
    const page = Number.parseInt(e.target.text);
    await this.props.onPaging(page)
    this.setState({ current: page })
  }

  render() {
    const total = this.props.total;
    const current = this.state.current;

    const pages = [];


    var start = Math.floor((current - this.MAX / 2))
    if (start < 1)
      start = 1;

    console.log("current page: " + current)
    if (start >= 2) {
      pages.push(<a key={"pg_1"} value={1} className={"paginate ml-1 mr-1 "} onClick={this.gotoPage.bind(this)}>{"1 "}</a>);
      if (start != 2)
        pages.push(<Fragment key="pg_etc1">... </Fragment>);

    }
    for (var i = start; i <= total; i++) {
      const isCurrent = (i == current) ? "current" : "";
      // console.log("current decor applied: " + var + " / " + i);
      pages.push(<a key={"pg_" + i} value={i} className={"paginate ml-1 mr-1 " + isCurrent} onClick={this.gotoPage.bind(this)}>{i}</a>);
      if ((i - start + 1) >= this.MAX) {
        pages.push(<Fragment key="pg_etc2">... </Fragment>);
        pages.push(<a key={"pg_" + total} className="paginate ml-1 mr-1" onClick={this.gotoPage.bind(this)}>{total}</a>);
        break;
      }
    }

    return (
      <div className="mt-2 mb-2">
        Page: [ {pages} ]
      </div>
    )
  }
}
class Collab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      currentTask: null,
      affectedRows: {},
      affectedCols: {},
      reviewProposal: false,
      isLoading: true,
    };

  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  async onPaging(page) {
    console.log("Query for page " + page);
    const t = await this.props.client.service('tasks').get(1, { query: { page: page } });
    console.log("new data");
    console.log(t);
    this.setState({ currentTask: t });
  }

  async componentWillMount() {
    console.log("Collab: component will mount.")

    const tasks = await this.props.client.service('tasks').find({});
    this.setState({ tasks: tasks })
    if (tasks.length === 0)
      return;
    console.log(tasks[0].title);
    // console.log(tasks[0].fields);
    this.setState({ tasks: tasks })
    const t = await this.props.client.service('tasks').get(tasks[0].id);
    const fields = [];
    console.log(t);
    Object.entries(t.fields).forEach((field, index) => {
      fields.push(field[1]);
    });
    this.setState({ fields: fields, currentTask: t });
    // console.log(this.state.fields);

  }

  onFieldClicked(element, editingField, fieldDef) {

    this.setState({
      currField: element, fieldDef: fieldDef,
      editingField: true, editingFieldComp: editingField,
      fieldInitial: editingField.getRawValue()
    });

    this.windowOffset = window.scrollY;
    document.body.setAttribute('style', `position: fixed; top: -${this.windowOffset}px;left: 0;right:0`);
  }

  reviewProposal() {
    console.log("All fields touched ...");
    var rows = Object.entries(this.state.affectedRows);
    for (var i = 0; i < rows.length; i++) {
      var row = Object.entries(rows[i][1]);
      console.log(row);

      for (var j = 0; j < row.length; j++) {
        var f = row[j];
        console.log(" -- " + f[1].props.fieldDef.name + ": " + f[1].state.proposedValue);
      }

    }
  }

  async taskChanged(e) {
    console.log("taskChanged!");
    console.log(e);
    const t = await this.props.client.service('tasks').get(e.target.id);
    this.setState({currentTask: t})
    console.log(t);
  }


  discardClicked(e) {
    this.setState({ affectedRows: {} });
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
                  <Dropdown.Toggle variant="success" id="task-dropdown">
                    {this.state.tasks.length > 0 ? this.state.currentTask.title : "<None>"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {
                      this.state.tasks.map((task, index) => {
                        // if (index === 0)
                        //   return;
                        return (
                          // <Dropdown.Item >
                            <a onClick={this.taskChanged.bind(this)}  key={"task_" + task.id} id={task.id} className="dropdown-item" >({task.id}) {task.title}
                            </a>
                          // </Dropdown.Item>
                        )
                      })
                    }

                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </div>
          <div className="col col-sm-auto">
            <i>({Object.values(this.state.affectedRows).length} rows touched)</i>
          </div>

        </div>

        <Paginate total={this.state.currentTask.pages} onPaging={this.onPaging.bind(this)} />
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
                // if (index === 0)
                //   return (null)
                if (this.state.fields) {
                  // var fs = Object.entries(this.state.currentTask.fields);
                  // console.log(fs[5][1].input)
                }
                // console.log(row);
                const pk = this.state.fields ? row[this.state.currentTask.pkCol] : -1;
                if (!this.state.affectedRows[pk]) {
                  this.state.affectedRows[pk] = {};
                }
                return (

                  <tr key={"_c_" + index}>
                    {row.map((field, vindex) => {
                      if (this.state.fields) {
                        // console.log("This fields ...");
                        // console.log(this.state.fields);
                        // console.log(this.state.fields[vindex]);
                      }

                      return (
                        <td id={"td_c_" + index + "_" + vindex} key={"td_c_" + index + "_" + vindex} className="td-bottom">
                          <EditableField fieldDef={this.state.fields ? Object.values(this.state.fields)[vindex] : null}
                            row={index} col={vindex} id={"_c_" + index + "_" + vindex}
                            primaryKey={pk}
                            onFieldClicked={this.onFieldClicked.bind(this)}
                            editable={(!this.state.fields) ? false : Object.entries(this.state.currentTask.fields)[vindex][1].input}
                            proposed={this.state.affectedRows[pk][vindex]}
                            value={field}>
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
    var affected = this.state.affectedRows
    // this.state.editingFieldComp.setState({ edited: true, proposedValue: value });

    console.log(value);

    if (!affected[comp.props.primaryKey])
      affected[comp.props.primaryKey] = {};
    affected[comp.props.primaryKey][comp.props.col] = {
      col: comp.props.col,
      value: value,
      fieldDef: comp.props.fieldDef,
      edited: true
    }

    // HACKY: Standard headers
    const data = Object.values(this.state.currentTask.data)[comp.props.row];

    // console.log(Object.values(this.state.currentTask.data));

    var fieldCols = this.state.affectedCols;
    fieldCols[comp.props.col] = comp.props.fieldDef;
    fieldCols[comp.props.col].col = comp.props.col;

    for (var i = 0; i < 4; i++) {
      fieldCols[i] = this.state.fields[i];
      fieldCols[i].col = i;
      affected[comp.props.primaryKey][i] = {
        col: i,
        // row: comp.props.row,
        fieldDef: this.state.fields[i],
        value: data[i],
        edited: false
      }
    }
    console.log(affected[comp.props.primaryKey]);

    this.onFieldEditorClosed();
  }

  onFieldEditorClosed() {
    this.setState({ editingField: false, fieldInitial: null });
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
          Submit Proposals</button>
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
          initialValue={this.state.fieldInitial}
          currField={this.state.currField}></ProposeValueModal>

        <ReviewProposalModal isOpen={this.state.reviewProposal}
          cols={this.state.affectedCols}
          onClosed={this.onReviewClosed.bind(this)}
          userid={this.props.user ? this.props.user.id : -1}
          client={this.props.client}
          task={this.state.currentTask}
          data={this.state.affectedRows}
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
