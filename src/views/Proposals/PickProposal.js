import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';
import Autosuggest from 'react-autosuggest';
import { Card } from 'reactstrap';
import _ from 'lodash';



class PickProposalModal extends Component {
  constructor(props) {
    super(props);
    this.state = {


    };
  }

  componentWillMount() {
    Modal.setAppElement('body');
  }



  componentWillUpdate() {
    // if (this.props.comp) {

    //   const field = this.props.comp.state;
    //   console.log("field");
    //   console.log(field);
    //   if (field.acceptedValue) {
    //     console.log("has an accepted value: ");
    //     console.log(field.acceptedValue);
    //     this.setState({ pick: field.acceptedValue })
    //   }

    // }
  }
  cleanup() {

    this.setState({ pick: null });

  }

  handleCancel(e) {
    this.props.onClosed();
    this.cleanup();

  }


  handleSubmit(value, e) {
    this.setState({ pick: value })
    // console.log("Selected: " + value);
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


  renderValue(val) {

    const id = val.hasOwnProperty("c_personid") ? (" (" + val.c_personid + ")") : "";
    if ((val.hasOwnProperty("c_name_chn")))
      return val.c_name_chn + id;
    else if (val.hasOwnProperty("c_name"))
      return val.c_name + id;
    else
      return val;
  }

  render() {
    // console.log(thi)
    var  dialogStyle = "confirm-dialog modal-lg width-50 height-50";
    
    return (
      <Modal isOpen={this.props.isOpen} className={dialogStyle} >
            <div className="modal-header">Adopt a proposal 
              <button type="button" className="close" onClick={this.handleCancel.bind(this)} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button></div>
            <div className="modal-body pt-2 ">
              <div className="container">
                <div className="row">
                  <div className={"col col-sm-6"}>
                    {this.renderProposals()}
                  </div>
                  <div className={"col col-sm-6"}>
                    {this.renderPersonInfo()}
                  </div>
              </div>


          </div>
        </div>
      </Modal>
    )
  }

  handleHover(v) {
    this.setState({ pick: v });
    if (v.c_personid)
      this.getPerson(v.c_personid)
  }

  renderProposals() {
    // Expecting an array
    const proposals = (this.props.comp) ? this.props.comp.props.values : [];
    // console.log(this.props.comp);
    // console.log(proposals);
    return (
      <div>

        {(proposals) && proposals.map((v, index) => {
          var styles = "cardoption";
          console.log("Current value & accepted value");
          console.log(v);
          console.log(this.props.origValue);
          if (v === this.props.acceptedValue || (!this.props.acceptedValue && _.isEqual(v,this.props.origValue)))
            styles += " cardaccepted cardselected"

          return (
            <div className="row" key={"pick_" + index}>
              <div className={"col mb-2 mt-2 ml-1 mr-1 col-sm-12 " + styles}>
                <div className="row">
                  <div className="col col-9 text-nowrap" onMouseEnter={this.handleHover.bind(this, v)} onClick={this.handleSubmit.bind(this, v)}>{this.renderValue(v)}</div>
                  <div className="col col-2"><svg width="0.8em" height="0.9em" viewBox="0 0 16 16" className="bi bi-check2-circle" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M15.354 2.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L8 9.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                    <path fillRule="evenodd" d="M8 2.5A5.5 5.5 0 1 0 13.5 8a.5.5 0 0 1 1 0 6.5 6.5 0 1 1-3.25-5.63.5.5 0 1 1-.5.865A5.472 5.472 0 0 0 8 2.5z" />
                  </svg>
                  </div>
                </div>
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

  async getPerson(id) {
    if (!id)
      return;
    try {
      this.setState({ isLoading: true });
      const data = await this.props.client.service('person').get(id);
      this.setState({ isLoading: false })
      console.log("Got person data!")
      this.setState({ person: data })
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  }

  renderPersonInfo() {
    var pick = this.state.pick;
    if (!pick && this.props.acceptedValue) {
      pick = this.props.acceptedValue;
    } else if (!pick && this.props.origValue) {
      pick = this.props.origValue;
    }
    if (!pick || !pick.c_personid) {
      return (
        <div>
          <div className=" container">
            <h5> Select a proposal from the left. </h5>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className=" container">


            <div className="row hr-bottom">
              <b>{pick.c_name_chn} </b>

              <div>{pick.c_name} </div>
            </div>


            <div className="row">
              CBDB Person ID: {pick.c_personid}
            </div>
            <div className="row">
              Year of birth: {pick.c_birth_year}

            </div>
            <div className="row">
              Nianhao: {pick.c_birth_nh}
            </div>
            <div className="row">
              Basic Affiliation(籍贯)：{this.state.person && this.state.person.c_jiguan_chn}
            </div>
            <div className="row">
              Dynasty(朝代)：{this.state.person && this.state.person.c_dynasty_chn}
            </div>
            <div className="row">
              <p>{pick.c_notes} </p>
            </div>
          </div>

        </div >

      )
    }

  }
}
export default PickProposalModal;
