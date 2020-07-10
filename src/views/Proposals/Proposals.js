import React, { Component, Fragment } from 'react';
import MultiField from "./MultiField.js";
import { Card, Dropdown } from 'react-bootstrap';

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
      acceptedValues: {},
      proposedFieldCols: {},
      reviewProposal: false,
      isLoading: true,
    };

  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  async componentWillMount() {
    const t = await this.props.client.service('tasks').get(1, { query: { proposals: "all", proposedOnly: "true" } });
    this.state.tasks.push(t);
    this.setState({ myTask: t });
    this.setState(this.state);

    const fields = [];
    console.log(t);
    Object.entries(t.fields).forEach((field, index) => {
      fields.push(field[1]);
    });
    this.setState({ myFields: fields });
    // console.log(this.state.myFields);

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


  reviewClicked(e) {
    this.setState({ reviewProposal: true })

  }

  renderMyTask() {
    if (!this.state.myTask) {
      return null;
    }
    const task = this.state.myTask;
    console.log(task);
    console.log(task.proposals)
    const data = Object.values(task.data);

    console.log(data);

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
            <i>({Object.values(this.state.acceptedValues).length} rows touched)</i>
          </div>

        </div>

          <Table hover responsive className="table-outline mb-0 d-none d-sm-table">
            <thead className="thead-light">
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
                  console.log(row);
                  const pk = this.state.myFields ? row[this.state.myTask.pkCol] : -1
                  return (
                    <tr key={"_c_" + index}>
                      {row.map((origValue, vindex) => {
                        return (
                          <td id={"td_c_" + index + "_" + vindex} key={"td_c_" + index + "_" + vindex}>
                            {this.renderMultiField(origValue, pk, index, vindex)}
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


  renderMultiField(origValue, pk, index, vindex) {
    var displayValue = origValue;
    if (!this.state.myFields) {
      return (<div></div>)
    }
    const task = this.state.myTask;
    const proposals = task.proposals[pk];
    const fieldName = this.state.myFields[vindex].field_name;
    // console.log(proposals);

    const pValues = [];

    for (var i = 0; i < proposals.length; i++) {
      // console.log("Added field prop value ..." + proposals[i]);
      if (task.fields[fieldName].input && proposals[i].hasOwnProperty(fieldName)) {

        pValues.push(proposals[i][fieldName]);
      }
    }
    if ((!origValue || origValue === "") && pValues.length > 0) {
      displayValue = <MultiField fieldDef={this.state.myFields ? this.state.myFields[vindex] : null}
        row={index} col={vindex} id={"_c_" + index + "_" + vindex}
        primaryKey={pk}
        onFieldClicked={this.onFieldClicked.bind(this)}
        values={pValues}>
      </MultiField>
    } else {
      displayValue = <div>{origValue}</div>
    }
    return displayValue;
  }


  // Expecting a person object
  onProposalAccepted(value) {
    const comp = this.state.editingFieldComp;
    const accepted = this.state.acceptedValues;
    comp.setState({ acceptedValue: value });

    const pk = comp.props.primaryKey;
    const col = comp.props.col;
    const field = comp.props.fieldDef;
    if (!accepted[pk])
      accepted[pk] = {};

    accepted[pk][col] = {
      col: col,
      value: value,
      fieldDef: field,
      edited: true
    }

    // // HACKY: Standard headers
    // const data = Object.values(this.state.myTask.data)[comp.props.row];

    // var fieldCols = this.state.proposedFieldCols;
    // fieldCols[comp.props.col] = comp.props.fieldDef;
    // fieldCols[comp.props.col].col = comp.props.col;

    // for (var i = 0; i < 4; i++) {
    //   fieldCols[i] = this.state.myFields[i];
    //   fieldCols[i].col = i;
    //   adopted[comp.props.primaryKey][i] = {
    //     col: i,
    //     // row: comp.props.row,
    //     fieldDef: this.state.myFields[i],
    //     value: data[i],
    //     edited: false
    //   }
    // }

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
          Finalize changes</button>
          </div>
          <div className="col col-sm-auto float-right">


            <button type="button" onClick={this.reviewClicked.bind(this)} className="btn col col-sm-auto  btn-warning float-right mb-3 " data-dismiss="modal" >
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
          // fieldDef={this.state.fieldDef}
          // proposals={this.state.currFieldProposals}
          currField={this.state.currField}></PickProposalModal>
      <ReviewProposalModal isOpen={this.state.reviewProposal}
          cols={this.state.proposedFieldCols}
          onClosed={this.onReviewClosed.bind(this)}
          userid={this.props.user ? this.props.user.id : -1}
          client={this.props.client}
          task={this.state.myTask}
          data={this.state.acceptedValues}
        />

        <div>
          {this.renderTasks()}
        </div>

      </Fragment >
    );
  }
}

export default Proposals;
