import React, { Component, Fragment } from 'react';
import { HubotIcon, PinIcon, LightBulbIcon} from '@primer/octicons-react'


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

    console.log("Resetting? " + this.props.resetToggle + " // " + newProps.resetToggle);
    if (!this.props.resetToggle && newProps.resetToggle) {
      this.setState({acceptedValue: null})
    }
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


  _renderByType(val, type) {
    // console.log(type);
    // console.log(this.props.fieldDef);
    const id = val.hasOwnProperty("c_personid") ? (" (" + val.c_personid + ")") : "";
    if ((val.hasOwnProperty("c_name_chn")))
      return val.c_name_chn + id;
    else if (val.hasOwnProperty("c_name"))
      return val.c_name+ id;
    else
      return val;
  }

  renderValue() {
    const type = this.props.fieldDef.type;
    

    if (this.state.acceptedValue && this.state.acceptedValue.page==this.props.page) {
      // console.log(this.state.acceptedValue);
        return this._renderByType(this.state.acceptedValue, type);
      
    } else {
      // console.log(this.props.values);
      
      if (this.props.origValue) {
        // console.log(this.props.origValue);
        return this._renderByType(this.props.origValue, type);
      } else {
        // console.log(this.props.values[0]);
        return this._renderByType(this.props.values[0], type);
      }
      
    }
  }

  render() {
    var icon = ""
    var name = "multifield pending"
    if(this.state.acceptedValue && this.state.acceptedValue.page==this.props.page){
      icon=<PinIcon></PinIcon>
      name="multifield accepted"
    }
    // var icon = !this.state.acceptedValue && this.state.acceptedValue.page==this.props.page ? "" : (<PinIcon></PinIcon>);

    return (
      <div className={name} id={this.props.id} onClick={this.handleEdit.bind(this)}>
        {icon} &nbsp;
        <label ref={this._saveRef.bind(this)} className='' id={"_f_" + this.props.id}>
          {this.renderValue()}
        </label>
      </div>
    )

  }
}

export default MultiField;
