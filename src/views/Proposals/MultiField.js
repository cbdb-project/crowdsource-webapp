import React, { Component, Fragment } from 'react';

class MultiField extends Component {
  constructor(props) {
    super(props);
    this.ESCAPE_KEY = 27;
    this.ENTER_KEY = 13;
    this.state = {
      editText: props.value,
      editing: false
    };
    this.element = {};
  }
  componentWillReceiveProps(newProps) {
    this.setState({ accepted: newProps.accepted })
  }

  handleEdit(e) {
    console.log("Clicked ...");
    console.log(this.props);
    this.props.onFieldClicked(this.element, this, this.props.fieldDef);

    return (e) => {
      this.setState({
        editing: !this.state.editing
      })
    };
  }


  _saveRef(el) {
    // el can be null - see https://reactjs.org/docs/refs-and-the-dom.html#caveats-with-callback-refs
    if (!el) return;

    this.element = el;
  }

  renderValue() {
    if (this.state.acceptedValue) {
      if (this.props.fieldDef.type === "person")
        return this.state.acceptedValue.c_name_chn;
      else {
        // console.log(this.state.acceptedValue);
        return this.state.acceptedValue;
      }

    } else {
      // console.log(this.props.values);
      return this.props.values[0];
    }
  }

  render() {

    return (
      <div className={!this.state.acceptedValue ? 'multifield pending' : 'multifield accepted'} id={this.props.id} onClick={this.handleEdit.bind(this)}>
        <label ref={this._saveRef.bind(this)} className='' id={"_f_" + this.props.id}>
          {this.renderValue()}
        </label>
      </div>
    )

  }
}

export default MultiField;
