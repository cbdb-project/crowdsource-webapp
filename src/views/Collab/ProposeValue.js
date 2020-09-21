import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';
import Autosuggest from 'react-autosuggest';
import { Card } from 'reactstrap';
import { ChevronDownIcon, DotFillIcon, ArrowUpRightIcon, XIcon, InsightsIcon } from '@primer/octicons-react'


class ProposeValueModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: []
    };
  }

  handleChange(e) {
    console.log("handleChange() new val");
    var val = e.target.value;

    if (val) {
      // console.log(val);
      this.setState({ value: val, pick: null })

      if (val.trim() != "") {

        this.queryAndUpdate(val);
        this.setState({ validInput: true })
      }
      else {

        this.setState({ suggestions: [], validInput: false });
      }
    } else {
      this.setState({ value: "", suggestions: [], validInput: false, pick: null })
    }

  }

  cleanup() {

    // console.log("Cleanup!");
    this.setState({
      pick: null,
      validInput: false,
      person: null,
      value: "", suggestions: [],
      errorMessage: null
    }, () => {

      console.log(this.state.value);
    }
    );


  }

  handleCancel(e) {
    this.cleanup();
    this.props.onClosed();


  }

  _wrapPersonIf(p) {
    // console.log("Wrap person:")
    // console.log(p);
    if (this.props.fieldDef.type === "person") {
      if (typeof p !== "object") {
        return {
          c_name_chn: p
        }
      } else {
        return p;
      }
    }
    else {
      return p;
    }

  }

  isInteger(str) {
    return /^\+?(0|[1-9]\d*)$/.test(str);
  }

  handleSubmit(e) {
    console.log(" handle submit");
    // console.log(this)
    this.setState({ errorMessage: null });

    const def = this.props.fieldDef;
    console.log("To submit value: " + this.state.value);
    if (def.type === "int" && !this.isInteger(this.state.value)) {
      this.setState({ errorMessage: "Error! Only an integer is allowed for this field." })
      return;
    }

    if (def.type === "number" && isNaN(this.state.value)) {
      this.setState({ errorMessage: "Error! Only a number is allowed for this field." })
      return;
    }
    var val = this._wrapPersonIf(this.state.pick ? this.state.pick : this.state.value);

    this.props.onSubmit(val)

    if (this.state.value) {
      this.setState({
        editText: val,
        editing: false,
      });
    }
    this.cleanup();

  }

  // Teach Autosuggest how to calculate suggestions for any given input value.
  getSuggestions(val) {
    // console.log("getSuggestions()");
    if (!val || val.trim() === "") {
      return [];
    }
    val = val.trim().toLowerCase();
    // console.log("Typing ... ");
    this.queryAndUpdate(val);
    return this.state.suggestions;
  }


  async getPerson(id) {
    if (!id)
      return;
    try {
      this.setState({ person: null });
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

  async queryAndUpdate(q) {

    this.setState({ isLoading: true });
    if (!q || q === "")
      return;
    try {
      const data = await this.props.client.service('person').find({ query: { q: q } });
      this.setState({ isLoading: false })
      console.log(data);
      if (data == null) {
        data = [];
      }
      data.unshift({ c_name: "Suggest this as a new person", useUserInput: true })
      this.setState({ suggestions: data })
    } catch (e) {
      console.log(e);
    }
  }


  searchTyping(e) {

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

  componentWillMount() {
    Modal.setAppElement('body');

  }


  componentWillReceiveProps(next) {
    // console.log("will receive props!")
    // console.log(next);
    // console.log(next.fieldDef);
    this.props = next;
    // this.setState( {
    //   value: "hello"
    // })
    if (next.initialValue) {
      if (next.fieldDef && next.fieldDef.type === "person") {
        var p = this._wrapPersonIf(next.initialValue)
        this.setState({
          value: p.c_name_chn,
          pick: p
        })
        if (p.c_personid)
          this.getPerson(p.c_personid);
      } else {
        this.setState({
          value: next.initialValue
        })
      }

    }
  }

  renderMessage() {
    if (this.state.errorMessage) {
      return (
        <div className="row mt-2 mb-0 align-items-end alert alert-danger" >
          {this.state.errorMessage}
        </div>
      )
    }

  }
  render() {

    const disabled = (this.state.validInput ? "" : "disabled");
    const isPersonBox = (this.props.fieldDef && this.props.fieldDef.type == "person")

    const personInfoBox = isPersonBox ? (
      <Fragment>
        <div className="mt-3"></div>

        {/* <div className="scrollable"> */}
        {this.renderPersonInfo()}
        {/* </div> */}
      </Fragment>
    ) : "";

    var dialogStyle = "confirm-dialog modal-lg width-50 scrollable"
    dialogStyle += isPersonBox ? " height-50" : "";

    const title = "Propose a value " + (this.props.fieldDef != null ? (": " + this.props.fieldDef.name) : "")

    // console.log(thi)
    return (
      // style={{ overlay: { position: "absolute", right: "auto", bottom: "auto", top: this._absPos(this.props.currField).top, left: this._absPos(this.props.currField).left } }}
      <Modal isOpen={this.props.isOpen} className={dialogStyle}>

        <div className="modal-header">{title}
          <button type="button" className="close" onClick={this.handleCancel.bind(this)} aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body ">
          <div className="container-fluid ">
            <div className="row">
              <div className="col float-left ml-0 mr-3">
                {this.renderField()}
                {personInfoBox}
              </div>
              <div className="col col-sm-auto">
                <div className="row">
                  <button type="button" disabled={disabled} className="ml-2 col-sm-auto lite-button " data-dismiss="modal" onClick={this.handleSubmit.bind(this)}>
                    <ArrowUpRightIcon></ArrowUpRightIcon>&nbsp;
                    <div className="float-right ml-2">Submit</div>
                  </button>
                  <button type="button" className="ml-2 col-sm-auto lite-button" data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
                    <XIcon></XIcon>
                    <div className="float-right ml-2">Cancel</div>
                  </button>
                </div>
              </div>

            </div>

            {this.renderMessage()}

          </div>


        </div>

      </Modal>
    )
  }

  renderField() {
    if (this.props.fieldDef && this.props.fieldDef.type === "person") {
      return this.renderPersonField();
    } else {
      return this.renderRegularField();
    }


  }

  renderTitle() {
    // console.log(this.props.currField);
    if (this.props.fieldDef)
      return "Propose a new value (" + this.props.fieldDef.name + ")";

  }

  renderRegularField() {
    // console.log("renderRegularField()")
    return (

      <div className="">
        <input type="text" className="line-input  w-100 form-control"
          onSubmit={this.handleSubmit.bind(this)} onChange={this.handleChange.bind(this)}
          placeholder="Input a number or string" aria-label="Recipient's username with two button addons" aria-describedby="button-addon4"
          value={this.state.value}>
        </input>
      </div>
    )
  }

  renderPersonField() {
    const renderSuggestion = suggestion => {
      var text;
      if (suggestion.c_name_chn) {
        text = suggestion.c_name_chn;
      } else if (suggestion.c_name) {
        text = suggestion.c_name;
      }
      if (suggestion.c_personid) {
        text += " (" + suggestion.c_personid + ")";
      }
      return (<div>{text}</div>)
    };
    const getSuggestionValue = suggestion => {
      // console.log(suggestion);
      return suggestion.c_personid;
    }

    const onSuggestionSelected = (evt, props) => {
      var textValue = props.suggestion.c_name_chn;
      var value = props.suggestion;
      if (props.suggestion.useUserInput) {
        textValue = this.state.value;
        value = { c_name_chn: textValue }
        value.newPerson = true;
      }
      this.setState({
        value: textValue,
        pick: value,
        validInput: true

      });
      console.log("Getting person id:" + props.suggestion.c_personid)
      this.getPerson(props.suggestion.c_personid);

    }


    const onSuggestionsFetchRequested = ({ value }) => {
      this.setState({
        suggestions: this.getSuggestions(value)
      });
    };

    const onSuggestionsClearRequested = () => {
      this.setState({
        suggestions: []
      });
    };
    const { suggestions } = this.state;
    // console.log("Suggestions:");
    // console.log(suggestions);


    var renderPersonId = () => {
      const p = this.state.pick;
      var text;
      if (p && p.newPerson) {
        text = <div>(NEW)</div>
      } else if (p && p.c_personid) {
        text = <div>(id {p.c_personid})</div>
      } else {
        text = <div></div>
      }

      return (
        <Fragment>
          {text}
        </Fragment>
      )
    }

    return (
      <Fragment>
        <div>

          <Autosuggest
            suggestions={suggestions}
            className="line-input"
            onSuggestionsFetchRequested={onSuggestionsFetchRequested.bind(this)}
            onSuggestionsClearRequested={onSuggestionsClearRequested.bind(this)}
            onSuggestionSelected={onSuggestionSelected.bind(this)}
            getSuggestionValue={getSuggestionValue.bind(this)}
            renderSuggestion={renderSuggestion.bind(this)}
            inputProps={{ className: "line-input w-100", placeholder: "Search a person", value: this.state.value, onSubmit: this.handleSubmit.bind(this), onChange: this.handleChange.bind(this) }}
          >


          </Autosuggest>


          {renderPersonId()}

        </div>


      </Fragment>
    )
  }




  renderPersonInfo() {
    var p = this.state.pick;
    var personInfo;
    if (p && p.newPerson) {
      personInfo = (
        <Fragment>
          <div className="row">
            <i>(This person does not exist in CBDB. A new person will be proposed.)</i>
          </div>
        </Fragment>
      )
    }
    p = this.state.person;

    if (p && p.c_personid) {
      console.log("P object.");
      console.log(p);
      personInfo = (
        <div className="person-info scrollable ml-0 mt-5 pr-2 mt-4">
          <p><InsightsIcon></InsightsIcon> &nbsp; <b>{p.c_name_chn}</b></p>
          <p>{p.c_name}</p>
          <p>CBDB Person ID: {p.c_personid}</p>
          <p>Birth year: {p.c_birth_year} </p>
          <p>Basic Affiliation(籍贯)：{this.state.person && this.state.person.c_jiguan_chn}</p>
          <p>Dynasty(朝代)：{this.state.person && this.state.person.c_dynasty_chn}</p>
          <p>Notes：{p.c_notes}</p>
        </div>
      )
    }
    if (p) {
      return (
        <div>
          {personInfo}
        </div>
      )
    }
  }
}
export default ProposeValueModal;
