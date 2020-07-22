import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';
import Autosuggest from 'react-autosuggest';
const SERVER = 'http://' + window.location.hostname + ':5000'


class ProposeValueModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: []
    };
  }

  handleChange(e) {
    // console.log("handleChange() new val");
    var val = e.target.value;

    if (val) {
      // console.log(val);
      this.setState({ value: val })
      if (val.trim() !== "")
        this.queryAndUpdate(val);
      else
        this.setState({ suggestions: [] });
    } else {
      this.setState({ value: "", suggestions: [] })
    }

  }

  cleanup() {

    this.setState({ pick: null, value: "", suggestions: [] });

  }

  handleCancel(e) {
    this.props.onClosed();
    this.cleanup();

  }

  _wrapPerson(p) {
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

  handleSubmit(e) {
    // console.log("who ami ... handle submit");
    // console.log(this)
    var val = this._wrapPerson(this.state.pick ? this.state.pick : this.state.value);

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


  getPerson(id) {
    this.setState({ isLoading: true });
    fetch(SERVER + '/person/' + id)
      .then(res => res.json())
      .then((data) => {
        this.setState({ isLoading: false })
        console.log("Got person data!")
        this.setState({ person: data })
        console.log(data);


      })
      .catch((e) => {
        console.log(e);
        this.setState({ person: [] });

      });
  }

  queryAndUpdate(q) {
    this.setState({ isLoading: true });
    fetch(SERVER + '/people?q=' + q)
      .then(res => res.json())
      .then((data) => {
        this.setState({ isLoading: false })

        this.setState({ suggestions: data })
        if (data == null) {
          this.setState({ suggestions: [] })
        }
        // console.log("Query result size: " + data.length);
        // if (data.length > 0)
        //   console.log(data[0]);
        // console.log(" -- end -- query  ");

      })
      .catch((e) => {
        console.log(e);
        this.setState({ suggestions: [] });

      });
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



  render() {


    // console.log(thi)
    return (
      <Modal isOpen={this.props.isOpen} className="modal-small " style={{ overlay: { position: "absolute", right: "auto", bottom: "auto", top: this._absPos(this.props.currField).top, left: this._absPos(this.props.currField).left } }} >
        <div className="modal-dialog  mt-0 mb-0  " role="document">

          <div className="modal-content">

            {/* <div className="modal-header">
                <h5 className="float-left">{this.renderTitle()}</h5>
                <div className="float-right">
                  <button type="button" className=" pt-1 pb-1 pr-2 pl-2 btn btn-light " data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
                    <svg className="bi bi-x" width="0.8em" height="0.8em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z" />
                      <path fillRule="evenodd" d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z" />
                    </svg>
                  </button>
                </div>
              </div> */}

            <div className="modal-body ">
              <div className="container ">
                <div className="row  align-items-end">
                  <div className="float-left pl-0 col ml-0 mr-3" style={{ height: "100%" }}>{this.renderField()}</div>
                  <div className="col col-sm-auto">
                    <div className="row">
                      <button type="button" className="ml-2 col-sm-auto btn btn-primary" data-dismiss="modal" onClick={this.handleSubmit.bind(this)}>
                        {/* <span class="iconify" data-icon="bi-arrow-up-right-square-fill" data-inline="false"></span> */}
                        <svg className="bi bi-arrow-right-square" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                          <path fillRule="evenodd" d="M7.646 11.354a.5.5 0 0 1 0-.708L10.293 8 7.646 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0z" />
                          <path fillRule="evenodd" d="M4.5 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z" />
                        </svg>
                        <div className="float-right ml-2">Submit</div>
                      </button>
                      <button type="button" className="ml-2 col-sm-auto btn btn-warning" data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
                        {/* <span class="iconify" data-icon="bi-arrow-up-right-square-fill" data-inline="false"></span> */}
                        {/* <svg className="bi bi-arrow-right-square" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                        <path fillRule="evenodd" d="M7.646 11.354a.5.5 0 0 1 0-.708L10.293 8 7.646 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0z" />
                        <path fillRule="evenodd" d="M4.5 8a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z" />
                      </svg> */}
                        <div className="float-right ml-2">Cancel</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {this.renderPersonInfo()}

            </div>
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
    return (

      <div className="input-group">
        <input type="text" className="form-control"
          onSubmit={this.handleSubmit.bind(this)} onChange={this.handleChange.bind(this)}
          placeholder="Input a number or string" aria-label="Recipient's username with two button addons" aria-describedby="button-addon4">
        </input>
      </div>
    )
  }

  renderPersonField() {
    const renderSuggestion = suggestion => (
      <div>{suggestion.c_name_chn} ({suggestion.c_personid})</div>
    );
    const getSuggestionValue = suggestion => {
      // console.log(suggestion);
      return suggestion.c_personid;
    }

    const onSuggestionSelected = (evt, props) => {

      this.setState({
        value: props.suggestion.c_name_chn,
        pick: props.suggestion
      });
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
    return (
      <Autosuggest
        suggestions={suggestions}
        className="personinput"
        onSuggestionsFetchRequested={onSuggestionsFetchRequested.bind(this)}
        onSuggestionsClearRequested={onSuggestionsClearRequested.bind(this)}
        onSuggestionSelected={onSuggestionSelected.bind(this)}
        getSuggestionValue={getSuggestionValue.bind(this)}
        renderSuggestion={renderSuggestion.bind(this)}
        inputProps={{ placeholder: "Search a person", value: this.state.value, onSubmit: this.handleSubmit.bind(this), onChange: this.handleChange.bind(this) }}
      />
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
export default ProposeValueModal;
