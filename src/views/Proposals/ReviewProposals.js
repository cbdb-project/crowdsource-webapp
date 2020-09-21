import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';
import { ArrowUpRightIcon, XCircleFillIcon } from '@primer/octicons-react'

import {
  Card,
  Table,
} from 'reactstrap';

class ReviewProposalModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMessaging: false
    }
  }

  componentWillMount() {
    Modal.setAppElement('body');
  }

  renderChanges() {

  }

  handleSubmit() {
    this.setState({ showMessaging: true, message: "success" })
    this.props.onSubmit();
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
    if (fieldDef.type === "person")
      return value.c_name_chn;
    // return value;
    else {

      return value;
    }
  }

  renderMessage() {
    if (this.state.message === "success")
      return (
        <div>Changes submitted successfully!</div>
      )
    else if (this.state.message === "error")
      return (
        <b>Error! Failed to submit changes.</b>
      );
    else
      return (
        <b>Error! Unknown internal state.</b>
      )
  }

  render() {
    // if (Object.entries(this.props.data).length >0)
    // (this.props.cols) && (console.log(Object.entries(this.props.cols)));
    // console.log(this.props.data);
    const data = this.props.data;
    var cols = (data && Object.keys(data).length > 0) ? Object.values(data)[0] : [];
    // console.log(cols);

    var count = cols.length;
    var tdClass = ""
    // col-" + Math.floor(11 / count)"
    var editedTdClass = tdClass + " bg-info"


    const noChanges = !data || Object.keys(data).length == 0
    return (

      <Modal isOpen={this.props.isOpen} className="confirm-dialog modal-lg width-50 " >


        <div className="modal-header">Review adopted changes
        <button type="button" className="close" onClick={this.handleCancel.bind(this)} aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="modal-body " >
          {/* <p>Modal body text goes here.</p> */}
          <div style={!this.state.showMessaging ? { display: "none" } : {}}>
            {this.renderMessage()}
          </div>

          <div className="scrollable text-nowrap modal-table-wrapper" style={this.state.showMessaging ? { display: "none" } : {}} >
            <Table responsive className=" mb-4 overflow-auto">
              <thead className="data-table">
                <tr className=" ">
                  {
                    (cols) && cols.map((col, index) => {
                      return (
                        <th className={tdClass + " "} key={"rth_" + index}>{col.fieldDef.name}</th>
                      )
                    })
                  }
                </tr>
              </thead>
              <tbody>

                {
                  (noChanges) ?
                    ("No proposals adopted yet.") : ""
                }
                {(data) && Object.values(data).map((row, i) => {
                  // var values = r[1]);
                  console.log(row);
                  return (
                    <tr className=" " key={"rtr_" + i}>
                      {/* <td className=""><input defaultChecked type="checkbox" id={"rsel_" + i}></input></td> */}
                      {
                        row.map((v, j) => {
                          return (
                            <td className={v.edited ? editedTdClass : tdClass} key={"rtd_" + i + "_" + j}>
                              {this.renderValue(v.value, v.fieldDef)}
                            </td>
                          )

                        })
                      }

                    </tr>)
                })}

              </tbody>
            </Table>
          </div>


        </div>
        <div className="modal-footer">
          <button style={(this.state.showMessaging || noChanges) ? { display: "none" } : {}} type="button" className="ml-2 lite-button" data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
            <XCircleFillIcon />
            Cancel
          </button>
          <button style={(this.state.showMessaging || noChanges) ? { display: "none" } : {}} type="button" className="ml-2 lite-button" data-dismiss="modal" onClick={this.handleSubmit.bind(this)}>
            <ArrowUpRightIcon />
            Submit
          </button>

          <div style={(!this.state.showMessaging && !noChanges) ? { display: "none" } : {}}>
            <button type="button" className="lite-button" data-dismiss="modal" onClick={this.handleCancel.bind(this)}>Ok</button>
          </div>
        </div>


      </Modal >
    )
  }
}

export default ReviewProposalModal;