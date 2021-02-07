import React, { Component, Fragment } from 'react';
import ProposeValueModal from "./ProposeValue.js";
import ReviewProposalModal from "./ReviewProposal.js";
import AdvancedSearchModal from './AdvancedSearchModal.js'
import EditableField from "./EditableField.js";
import { Card, Dropdown } from 'react-bootstrap';
import { HeartFillIcon, XCircleFillIcon } from '@primer/octicons-react'


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

  inputPageChange(e){
    if(e.keyCode==13){
      var page = document.getElementById("inputPageChange").value;
      if(page <= 0 || page>this.props.total){
        alert("Plaese input correct page number.")
      }else{
        this.props.onPaging(page);
        this.setState({ current: page });
        document.getElementById("inputPageChange").value="";
      }
    }
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
        &nbsp;&nbsp;→&nbsp;Page&nbsp;&nbsp;
        <input id="inputPageChange" type="text" class="form-control" style={{display:"inline",width:"70px"}} onKeyDown={this.inputPageChange.bind(this)}></input>
      </div>
    )
  }
}
class Tasks extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      myTask: null,
      affectedRows: {},
      affectedCols: {},
      reviewProposal: false,
      isLoading: true,
    };

  }

  search_text =  "";

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  async onPaging(page) {
    console.log("Query for page " + page);
    try {
      const t = await this.props.client.service('tasks').get(this.state.myTask.id, { query: { page: page } });
      console.log("new data");
      console.log(t);
      this.setState({ myTask: t });
    } catch (e) {
      if (e.name === "NotAuthenticated") {
        await this.props.auth();
      }
    }

  }

  async loadTasks() {
    try {
      console.log("Loading tasks ...");
      const tasks = await this.props.client.service('tasks').find({});
      this.setState({ tasks: tasks })
      if (tasks.length === 0) {
        console.log("No task found!");
        return;
      }


      var taskId = tasks[0].id;

      const storedId = localStorage.getItem("myTask");
      console.log("stored id:" + storedId);
      if (storedId && storedId != "" && this.taskIdExists(tasks, storedId)) {
        console.log("yes! using stored id:" + storedId)
        taskId = storedId;
      }
      console.log(taskId);
      const t = await this.props.client.service('tasks').get(taskId);

      console.log(t);
      this.switchTask(t);
    } catch (e) {
      if (e.name === "NotAuthenticated") {
        await this.props.auth();
      }
      console.log(e);
    }
  }

  async componentWillMount() {
    console.log("Tasks: component will mount.")
    if (!this.props.user) {
      var r = await this.props.auth();
      if (!r) return;
    }
    this.loadTasks();
  }


  taskIdExists(tasks, id) {
    var exists = false;
    tasks.forEach((t) => {
      console.log(t.id == id);
      if (t.id == id) {
        exists = true;
      }
    })
    return exists;
  }

  switchTask(t) {
    const fields = [];
    Object.entries(t.fields).forEach((field, index) => {
      fields.push(field[1]);
    });
    this.setState({ fields: fields, myTask: t, affectedRows: {} });
    // console.log(this.state.fields);
    localStorage.setItem("myTask", t.id);
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

  async taskChanged(id) {
    console.log("taskChanged!");
    try {
      const t = await this.props.client.service('tasks').get(id);
      this.switchTask(t)
    } catch (e) {
      if (e.name === "NotAuthenticated") {
        await this.props.auth();
      }
    }
  }


  discardClicked(e) {
    this.setState({ affectedRows: {} });
  }

  reviewClicked(e) {
    this.setState({ reviewProposal: true })
  }

  rowsEdited() {
    var rows = Object.values(this.state.affectedRows);
    var count = 0;
    for (var i = 0; i < rows.length; i++) {
      var cols = Object.entries(rows[i]);
      var affected = false;
      for (var j = 0; j < cols.length; j++) {
        if (cols[j][1].edited) {
          affected = true;
          break;
        }
      }
      if (affected) count++;
    }
    return count;
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
                <option key={"task_" + task.id} onClick={this.taskChanged.bind(this, task.id)} >({task.id}) {task.title}
                </option>
              )
            })
          }
        </select>

      </div>
    )
  }

  renderCurrTask() {
    if (!this.state.myTask) {
      return null;
    }

    const data = Object.values(this.state.myTask.data);
    return (
      <div className="">

        <div className="row align-items-center justify-content-between mt-0 mb-1">

          <div className="col col-sm-auto">
            <div className="row align-items-center justify-items-end mb-1">
              {this.renderTaskDropdown()}
            </div>
          </div>
          <div className="col col-sm-auto">
            <i>({this.rowsEdited()} rows touched)</i>
          </div>

        </div>

        <Paginate total={this.state.myTask.pages} onPaging={this.onPaging.bind(this)} />
        <div className="fixed-table vh-80">
          <table className="table table-responsive scrollable data-table vh-80 table-outline align-bottom mb-0 d-none d-sm-table">
            <thead >
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
            {/* <div className="vh-80"> */}
            <tbody className="scrollable vh-80">

              {
                data.map((row, index) => {
                  // if (index === 0)
                  //   return (null)
                  if (this.state.fields) {
                    // var fs = Object.entries(this.state.myTask.fields);
                    // console.log(fs[5][1].input)
                  }
                  // console.log(row);
                  const pk = this.state.fields ? row[this.state.myTask.pkCol] : -1;
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
                              editable={(!this.state.fields) ? false : Object.entries(this.state.myTask.fields)[vindex][1].input}
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
            {/* </div> */}
          </table>
        </div>
      </div>
    )
  }
  changeFieldMode() {

  }


  // Expecting a person object
  onFieldEdited(value) {
    const comp = this.state.editingFieldComp;

    const pk = comp.props.primaryKey;
    const col = comp.props.col;
    const aRows = this.state.affectedRows

    if (!aRows[pk]) {
      aRows[pk] = {};
    }
    aRows[pk][col] = {
      col: col,
      value: value,
      fieldDef: comp.props.fieldDef,
      edited: true
    }

    // HACKY: Standard headers
    const data = Object.values(this.state.myTask.data)[comp.props.row];
    const fields = this.state.fields;
    var aCols = this.state.affectedCols;
    aCols[col] = comp.props.fieldDef;
    aCols[col].col = col;
    for (var i = 0; i < fields.length; i++) {
      if (fields[i].input)
        continue;
      aCols[i] = fields[i];
      aCols[i].col = i;
      aRows[pk][i] = {
        col: i,
        fieldDef: fields[i],
        value: data[i],
        edited: false
      }
    }
    console.log(aRows[pk]);

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
  
  searchInputChange(e){
    console.log(e.target.value);
    this.search_text = e.target.value;
  }

  async simpleSearch(){
    console.log("Simple Searching...");

    if(this.search_text!=""){
      try {
        const t = await this.props.client.service('tasks').create({id:this.state.myTask.id, dt:[]});
        console.log(t);
  
        var data = {}
        for(var key in t.data){
          var item = t.data[key];
  
          for(var val in item){
            if(typeof(item[val])=="object"){
              if(item[val]["c_name_chn"].includes(this.search_text)){
                data[key]=item;
                break;
              }
            }else{
              if(item[val].includes(this.search_text)){
                data[key]=item;
                break;
              }
            }
          }
  
        }
        t.data = data;
        t.pages =1;
        t.perPage = Object.keys(data).length;
        this.setState({ myTask: t });
        //Why not work???
        // const t = await this.props.client.service('tasks').search(this.state.myTask.id);
      } catch (e) {
        if (e.name === "NotAuthenticated") {
          await this.props.auth();
        }
        console.log(e)
      } 
    }else{
      this.taskChanged(this.state.myTask.id);
    }
       
  }

  onAdSearchClicked(){
    this.setState({
      advancedSearch: true
    });

    this.windowOffset = window.scrollY;
    document.body.setAttribute('style', `position: fixed; top: -${this.windowOffset}px;left: 0;right:0`);
  }

  onAdSearchClosed(){
    this.setState({ advancedSearch: false });
    document.body.setAttribute('style', '');
    window.scrollTo(0, this.windowOffset);
  }

  updateAdSearch(val){
    this.setState({myTask: val});
  }

  renderTasks() {
    // console.log(this.state.tasks);
    this.state.tasks.forEach((task, index) => {
      // console.log("hi");
      // return console.log(task);
    });
    if (this.state.tasks.length == 0) {
      return (
        <Card className="mt-4">
          <Card.Body>
            <div className="ml-2 mt-2 mb-2"> No tasks found. Try <a href="/#/import">import a new task</a>. </div>
          </Card.Body>
        </Card>
      )
    } else {
      return (
        <div>
          <div></div>
          <div className="row justify-content-between no-gutters mt-3">
            <div className="col form-inline ml-2 col-sm-auto float-left">
              <input type="text" class="form-control" style={{padding:"20px 25px", "margin-bottom":"30px"}} onChange={(e)=>this.searchInputChange(e)}></input>
              <button type="button" className="ml-2 blob-btn" onClick={this.simpleSearch.bind(this)}>SEARCH</button>
              <button type="button" className="ml-2 blob-btn" onClick={this.onAdSearchClicked.bind(this)}>ADVANCED SEARCH</button>
            </div>
            <div className="col mr-2 col-sm-auto float-right ">

              <button type="button" onClick={this.reviewClicked.bind(this)} className=" blob-btn   " data-dismiss="modal" >
                <HeartFillIcon></HeartFillIcon> &nbsp;
                Submit Proposals
                <span class="blob-btn__inner">
                  <span class="blob-btn__blobs">
                    <span class="blob-btn__blob"></span>
                    <span class="blob-btn__blob"></span>
                    <span class="blob-btn__blob"></span>
                    <span class="blob-btn__blob"></span>
                  </span>
                </span>
              </button>
              <button type="button" onClick={this.discardClicked.bind(this)} className="ml-2 blob-btn" data-dismiss="modal" >
                &nbsp; Discard</button>

            </div>
          </div>
          <Card className="app-card mt-3">
            <Card.Body>

              {this.renderCurrTask()}

            </Card.Body>
          </Card>
        </div>

      )
    }
  }
  render() {
    return (
      <Fragment>

        <ProposeValueModal isOpen={this.state.editingField}
          onSubmit={this.onFieldEdited.bind(this)}
          onClosed={this.onFieldEditorClosed.bind(this)}
          fieldDef={this.state.fieldDef}
          initialValue={this.state.fieldInitial}
          client={this.props.client}
          currField={this.state.currField}></ProposeValueModal>

        <ReviewProposalModal isOpen={this.state.reviewProposal}
          cols={this.state.affectedCols}
          onClosed={this.onReviewClosed.bind(this)}
          userid={this.props.user ? this.props.user.id : -1}
          client={this.props.client}
          task={this.state.myTask}
          data={this.state.affectedRows}
        />

        <AdvancedSearchModal isOpen={this.state.advancedSearch}
          onClosed={this.onAdSearchClosed.bind(this)}
          client={this.props.client}
          task={this.state.myTask}
          update={this.updateAdSearch.bind(this)}
          blankSearch={this.taskChanged.bind(this)}
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

export default Tasks;
