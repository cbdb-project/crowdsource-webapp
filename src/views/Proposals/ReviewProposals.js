import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';

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
      this.setState( {showMessaging: true, message: "success"})
      this.props.onSubmit();
    }
    cleanup() {
      this.setState( {showMessaging: false, message: null})
  
  
  
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
          <h4>Changes submitted successfully!</h4>
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
      var cols = (data && Object.keys(data).length > 0) ? Object.values(data)[0]: [];
      // console.log(cols);

      var count = cols.length;
      var tdClass = ""
      // col-" + Math.floor(11 / count)"
      var editedTdClass = tdClass + " bg-info"
      
  
      return (

        <Modal isOpen={this.props.isOpen} className="modal-dialog modal-lg" >
          <div className="  modal-dialog-centered" role="document">
            <div className="modal-content ">
  
              <div className="container mt-3"><h4 className="float-left">Review adopted changes</h4>
                <div className="float-right">
                  <button type="button" className="btn btn-light " data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
                    <svg className="bi bi-x" width="0.8em" height="0.8em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z" />
                      <path fillRule="evenodd" d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z" />
                    </svg>
                  </button>
                </div>
              </div>
  
              <div className="modal-body " >
                {/* <p>Modal body text goes here.</p> */}
                <div className="container"  style={!this.state.showMessaging ? { display: "none" } : {}}>
                  {this.renderMessage()}
                </div>
                <div className="container  " style={this.state.showMessaging ? { display: "none" } : {}}>
                  <div className="container-fluid  modal-table-wrapper">
                    <Table responsive className=" mb-0 overflow-auto">
                      <thead className="thead-light ">
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
  
                        {(data) && Object.values(data).map((row, i) => {
                          // var values = r[1]);
                          console.log(row);
                          return (
                            <tr className=" " key={"rtr_" + i}>
                              {/* <td className=""><input defaultChecked type="checkbox" id={"rsel_" + i}></input></td> */}
                              {
                                row.map((v, j) => {
                                    return (
                                      <td className={v.edited?editedTdClass:tdClass} key={"rtd_" + i + "_" + j}>
                                        {this.renderValue(v.value,v.fieldDef)}
                                      </td>
                                    )
                                  // } else {
                                  //   return (
                                  //     <td className={tdClass} key={"rtd_" + i + "_" + j}>
                                  //     </td>
                                  //   )
                                  // }
  
                                })
                              }
  
                            </tr>)
                        })}
  
                      </tbody>
                    </Table>
                  </div>
                  <div className="row mt-3">
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
        </Modal >
      )
    }
  }
  
  export default ReviewProposalModal;