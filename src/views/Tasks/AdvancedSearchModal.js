import React, { Component, Fragment } from 'react';
import Modal from 'react-modal';
import {ArrowUpRightIcon, XIcon, PlusCircleIcon, XCircleIcon} from '@primer/octicons-react'

import {
  Card,
  Row,
  Table,
} from 'reactstrap';

class AdvancedSearchModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 0
    }
  }

  async handleSearch() {
    var conditions = {
        relation:[],
        field:[],
        cons:[]
    }
    for(var i=0;i<=this.state.num;i++){
        if(i){
            var rel = document.getElementById(i+"_relation");
            conditions.relation.push(rel.value);
        }else{
            conditions.relation.push(-1);
        }
        var fie = document.getElementById(i+"_field");
        conditions.field.push(fie.value);
        var inp = document.getElementById(i+"_input");
        conditions.cons.push(inp.value);
    }
    // console.log(conditions);
    console.log("Advanced Searching...");

    if(this.state.num==0 && conditions.cons[0]==""){
        this.props.blankSearch(this.props.task.id);
        this.handleCancel();
    }else{
        try {
            const t = await this.props.client.service('tasks').create({id:this.props.task.id, dt:[]});
            console.log(t);
    
            var idx=[];
            for(var i=0;i<=this.state.num;i++){
                for(item in t.fields){
                    if(conditions.field[i]==t.fields[item]["name"]){
                        idx.push(t.fields[item]["col"]);
                    }
                }
            }
            // console.log(idx)
      
            var data = {};
            for(var key in t.data){
                var item = t.data[key];
                if(item[idx[0]].includes(conditions.cons[0])){
                    data[key]=item;
                }
            }        
            // console.log(data)
    
            for(var i=1;i<=this.state.num;i++){
                switch(conditions.relation[i]){
                    case "1":
                        //and
                        for(var key in data){
                            var item = data[key];
                            if(!item[idx[i]].includes(conditions.cons[i])){
                                data[key]=item;
                            }
                        }
                        break;
                    case "2":
                        //or
                        for(var key in t.data){
                            var item = t.data[key];
                            if(item[idx[i]].includes(conditions.cons[i])){
                                data[key]=item;
                            }
                        }
                        break;
                    case "3":
                        //not
                        for(var key in data){
                            var item = data[key];
                            if(item[idx[i]].includes(conditions.cons[i])){
                                delete data[key];
                            }
                        }
                        break;
                }
            }
    
            t.data = data;
            t.pages =1;
            t.perPage = Object.keys(data).length;
            this.props.update(t);
            this.handleCancel();
        } catch (e) {
        if (e.name === "NotAuthenticated") {
            await this.props.auth();
        }
        console.log(e)
        }
    }
    
  }

  cleanup() {
    this.setState({ num: 0 })
  }

  handleCancel(e) {
    this.props.onClosed();
    this.cleanup();
  }

  renderConditions(){
      var item = [];
      for(var i=1;i<=this.state.num;i++){
          item.push(
            <div className="row justify-content-between no-gutters mt-3" key={i}>
                <div className="col form-inline ml-2 col-sm-auto float-left">
                    <button type="button" style={{border:"none", "backgroundColor":"white"}} onClick={this.onMinusClicked.bind(this)}><XCircleIcon size={24}/></button>&nbsp;
                    <div className="col">
                        <select className="task-selector custom-select" style={{margin:"0"}} id={i+"_relation"}>
                            <option value={1}>与</option>
                            <option value={2}>或</option>
                            <option value={3}>非</option>
                        </select>
                    </div>
                    <div className="col">
                        <select className="task-selector custom-select" style={{margin:"0"}} id={i+"_field"}>
                            <option value={"作者"}>作者</option>
                            <option value={"作品標題"}>作品標題</option>
                            <option value={"通訊關係"}>通訊關係</option>
                            <option value={"文集"}>文集</option>
                        </select>
                    </div>
                    <input type="text" class="form-control" id={i+"_input"}></input>
                </div>                   
            </div>
          )
      }       
      
      return(
          <Fragment>
              {item}
          </Fragment>
      );
  }

  onPlusClicked(){
      var number = this.state.num + 1;
      if(number > 6){
          number = 6;
      }
      this.setState({
          num: number
      })
  }

  onMinusClicked(){
    var number = this.state.num - 1;
    this.setState({
        num: number
    })
  }

  render() {
    console.log("Advanced Search");
    return (
      <Modal isOpen={this.props.isOpen} className="confirm-dialog modal-lg width-50" >
        <div className="container align-items-end">

          <div className="modal-header">Advanced Search</div>

          <div className="modal-body " >
            <div className="container text-nowrap scrollable">
                <div className="row justify-content-between no-gutters mt-3">
                    <div className="col form-inline ml-2 col-sm-auto float-left">
                        <button type="button" style={{border:"none", "backgroundColor":"white"}} onClick={this.onPlusClicked.bind(this)}><PlusCircleIcon size={24}/></button>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <div className="col">
                            <select className="task-selector custom-select" style={{margin:"0"}} id="0_field">
                                <option key={1}  >作者</option>
                                <option key={2}  >作品標題</option>
                                <option key={3}  >通訊關係</option>
                                <option key={4}  >文集</option>
                            </select>
                        </div>
                        <input type="text" class="form-control" id="0_input"></input>
                    </div>                   
                </div>                  
              {this.state.num==0 ? null : this.renderConditions()}
            </div>
          </div>

          <div className="modal-footer  align-self-end" >
            <div className="row mt-3">
              <div>
                <button type="button" className="lite-button" data-dismiss="modal" onClick={this.handleCancel.bind(this)}>
                    <XIcon/>&nbsp; Cancel
                </button>
                <button type="button" className="ml-2 lite-button" onClick={this.handleSearch.bind(this)} data-dismiss="modal">
                    <ArrowUpRightIcon/>&nbsp;Search
                </button>
              </div>
            </div>
          </div>

        </div>
      </Modal >
    )
  }
}

export default AdvancedSearchModal;