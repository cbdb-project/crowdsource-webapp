import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';
import {ArrowUpRightIcon, XIcon } from '@primer/octicons-react'

import {
  Card,
  Row,
  Table,
} from 'reactstrap';

class ReviewProposalModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMessaging: false

    }
  }

  _makeProposal(pData) {
    const p = {
      task_id: this.props.task.id,
      author: this.props.userid,
    }

    const items = [];
    pData = Object.entries(pData);
    for (var i = 0; i < pData.length; i++) {

      var key = pData[i][0];
      var cols = Object.values(pData[i][1]);
      // Skip empty rows
      if (cols.length === 0)
        continue;
      var item = {};
      for (var j = 0; j < cols.length; j++) {
        if (!cols[j].edited) {
          continue;
        }
        var field = cols[j].fieldDef;
        const v = cols[j].value;
        if (field.type === "person") {
          item[field.field_name] = {
            c_personid: v.c_personid,
            c_name_chn: v.c_name_chn,
            c_name: v.c_name
          }
        }
        else {
          item[field.field_name] = cols[j].value;
        }
        item[this.props.task.pkField] = key;
      }
      items.push(item);
    }
    p.data = items;
    return p;
    console.log(p);
  }

  async handleSubmit() {
    this.setState({ showMessaging: true, message: "success" })
    console.log(this.props.data);
    var proposal = this._makeProposal(this.props.data);

    try {
      var a = await this.props.client.service('proposals').create(proposal);
    } catch (e) {
      if (e.name === "NotAuthenticated") {
        await this.props.auth();
        return;
      }
    }
    console.log(a);
  }
  cleanup() {
    this.setState({ showMessaging: false, message: null })


  }

  handleCancel(e) {
    this.props.onClosed();
    this.cleanup();

  }

  renderValue(value, fieldDef) {
    // console.log("Rendeirng ...");
    // console.log(fieldDef);
    if (fieldDef.type === "person" && value.hasOwnProperty("c_name_chn"))
      return value.c_name_chn;
    else {
      return value;
    }
  }

  renderMessage() {
    if (this.state.message === "success")
      return (
        <div>Proposal submitted successfully!</div>
      )
    else if (this.state.message === "error")
      return (
        <h5>Error! Failed to submit proposal.</h5>
      );
    else
      return (
        <h5>Unknown internal state.</h5>
      )
  }

  renderChanges() {
    var cols = Object.values(this.props.cols);
    var count = cols.length;
    var tdClass = ""
    // col-" + Math.floor(11 / count)"
    var editedTdClass = tdClass + " highlight-changes"

    return (
      <table className="table table-hover mb-2 data-table ">
        <thead className="">
          <tr className=" ">
            <th className=" "><input defaultChecked type="checkbox" id={"rsel_all"}></input></th>
            {
              (cols) && cols.map((field, index) => {
                return (
                  <th className={tdClass + " "} key={"rth_" + index}>{field.name}</th>
                )
              })
            }
          </tr>
        </thead>
        <tbody className="">

          {(this.props.data) && Object.entries(this.props.data).map((r, i) => {
            var values = r[1];
            if (Object.keys(r[1]).length === 0)
              return;
            return (
              <tr className=" " key={"rtr_" + i}>
                <td className=""><input defaultChecked type="checkbox" id={"rsel_" + i}></input></td>
                {
                  cols.map((c, j) => {
                    if (values[c.col]) {
                      return (
                        <td className={values[c.col].edited ? editedTdClass : tdClass} key={"rtd_" + i + "_" + j}>
                          {this.renderValue(values[c.col].value, values[c.col].fieldDef)}
                        </td>
                      )
                    } else {
                      return (
                        <td className={tdClass} key={"rtd_" + i + "_" + j}>
                        </td>
                      )
                    }

                  })
                }

              </tr>)
          })}

        </tbody>
      </table>
    )
  }

  render() {
    // if (Object.entries(this.props.data).length >0)
    // (this.props.cols) && (console.log(Object.entries(this.props.cols)));


    const hasChanges = (this.props.cols != null) && Object.values(this.props.cols).length > 0;
    const submitDisabled = hasChanges ? "disabled" : "enabled";

    console.log("has changes?");
    console.log(this.props.cols);
    return (
      <Modal isOpen={this.props.isOpen} className="confirm-dialog modal-lg width-50" >
        <div className="container align-items-end">

          <div className="modal-header">
            Review proposals
            </div>

          <div className="modal-body " >
            {/* <p>Modal body text goes here.</p> */}
            <div className="container" style={!this.state.showMessaging ? { display: "none" } : {}}>
              {this.renderMessage()}
            </div>
            <div className="container text-nowrap scrollable"  style={this.state.showMessaging ? { display: "none" } : {}}>
              {/* <div className="container-fluid modal-table-wrapper mt-2 mb-2"> */}
              {(hasChanges) ? this.renderChanges() : "No changes proposed. "}
              {/* </div> */}
            </div>

          </div>
          <div className="modal-footer  align-self-end" >
            <div className="row mt-3">
              <div style={this.state.showMessaging ? { display: "none" } : {}}>
                <button type="button" className="lite-button" data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
                <XIcon/>&nbsp;
                  Cancel</button>
                <button type="button" className="ml-2 lite-button" onClick={this.handleSubmit.bind(this)} data-dismiss="modal">
                  {/* <span class="iconify" data-icon="bi-arrow-up-right-square-fill" data-inline="false"></span> */}
                  <ArrowUpRightIcon/>&nbsp;
                  Submit
                </button>
              </div>
              <div style={!this.state.showMessaging ? { display: "none" } : {}}>
                <button type="button" className="btn lite-button" data-dismiss="modal" onClick={this.handleCancel.bind(this)}>Ok</button>
              </div>
            </div>
          </div>

        </div>



      </Modal >
    )
  }
}

export default ReviewProposalModal;