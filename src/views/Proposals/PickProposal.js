import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';
import Autosuggest from 'react-autosuggest';
import { Card } from 'reactstrap';


class PickProposalModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pick: null,
      
    };
  }

  componentWillMount() {
    Modal.setAppElement('body');
  }
  cleanup() {

    this.setState({ pick: null });

  }

  handleCancel(e) {
    this.props.onClosed();
    this.cleanup();

  }

  handleSubmit(value, e) {
    this.setState({pick: value})
    console.log("Selected: " + value);
    // if (this.props.fieldDef.type === "person")
    //   val = this.state.pick;
    // else
    //   val = this.state.value;

    this.props.onSubmit(value)

    this.cleanup();
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


  renderValue(value) {
    // console.log("Rendeirng ...");
    // console.log(fieldDef);
    if (this.props.fieldDef.type === "person")
      return value.c_name_chn;
      // return value;
    else {

      return value;
    }
  }

  render() {
    // console.log(thi)
    return (
      <Modal isOpen={this.props.isOpen} className="modal-small " style={{ overlay: { position: "absolute", right: "auto", bottom: "auto", top: this._absPos(this.props.currField).top, left: this._absPos(this.props.currField).left } }} >
        <div className="modal-dialog mt-0 mb-0 " role="document">

          <div className="modal-content">
          <div className="modal-header"><b>Adopt a proposal </b></div>
            <div className="modal-body pt-2 ">
              <div className="container ">
                {this.renderProposals()}
              </div>
              {this.renderPersonInfo()}

            </div>
          </div>
        </div>
      </Modal>
    )
  }

  renderProposals() {
    // Expecting an array
    const proposals = (this.props.comp)?this.props.comp.props.values:[];
    console.log(this.props.comp);
    console.log(proposals);
    return (
      <div>
        
        {(proposals) && proposals.map((v, index) => {
          var styles = "cardoption";
          if (v === this.props.comp.state.acceptedValue)
            styles += " cardaccepted"
          
          return (
            <div className="row" key={"pick_" + index}>
              
              <div className={"col card mb-2 mt-2 ml-1 mr-1 col-sm-8 " + styles}>
              <div className="row">
                <div className="col col-8" onClick={this.handleSubmit.bind(this, v)}>{this.renderValue(v)}</div>
                <div className="col col-2"><svg width="0.8em" height="0.8em" viewBox="0 0 16 16" className="bi bi-check2-circle" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M15.354 2.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L8 9.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                  <path fillRule="evenodd" d="M8 2.5A5.5 5.5 0 1 0 13.5 8a.5.5 0 0 1 1 0 6.5 6.5 0 1 1-3.25-5.63.5.5 0 1 1-.5.865A5.472 5.472 0 0 0 8 2.5z" />
                </svg>
                </div>
                </div>
              </div>
              <div className="col  mb-2 mt-2 ml-1  ml-1 mr-1 col-sm-2 ">
              (lei)
              </div>
              
            </div>
            
          )
        })}
      </div>
    )
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
              籍贯：{this.state.person && this.state.person.c_jiguan_chn}
            </div>
            <div className="row">
              朝代：{this.state.person && this.state.person.c_dynasty_chn}
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
export default PickProposalModal;
