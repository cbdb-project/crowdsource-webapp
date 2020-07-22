import React, { Component, Fragment } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
const { convertArrayToCSV } = require('convert-array-to-csv');


class Export extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [],
        }
    }

    _flatten(arr, fields) {
        // console.log(fields);
        var fs = Object.values(fields);
        return arr.map((r, i) => {
            // console.log("Current index: " + i);
            var row = r.map((c, j) => {
                if (fs[j].type === "person") {
                    // console.log(c);
                    return c.c_name_chn
                } else return c
            })
            return row;

        })

    }

    async csvClicked(e) {
        var rows = Object.values(this.state.myTask.data);
        const header = Object.keys(this.state.myTask.fields);
        rows = this._flatten(rows, this.state.myTask.fields);
        try {

            // console.log(this.state.myTask.fields);
            console.log(rows);
            var s = convertArrayToCSV(rows, {
                header: header,
                separator: ','
            });
            console.log(s);
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += s;
            var encodedUri = encodeURI(csvContent);
            window.open(encodedUri);
        } catch (e) {
            console.log(e);
        }
    }

    setTask(e) {

    }

    async componentWillMount() {
        const t = await this.props.client.service('tasks').get(1, { query: { edited: true } });
        this.state.tasks.push(t);
        // t.fields = new Map(t.fields);
        this.setState({ myTask: t });

    }

    render() {
        return (
            <div>
                <div className="card">
                    <div className="card-header">
                        Export Data
                    </div>
                    <div className="card-body">
                        <div className="row mb-3 justify-content-center align-items-center">
                            <div className="col d-flex justify-content-center">
                                Choose a task below and then click "Download" button.
                </div>
                        </div>
                        <div className="row mb-4 justify-content-center align-items-center">
                            <div className="col  d-flex justify-content-center">
                                <Dropdown>
                                    <Dropdown.Toggle variant="secondary" id="dropdown-basic" onClick={this.setTask.bind(this)}>
                                        {this.state.tasks.length > 0 ? this.state.tasks[0].title : "<None>"}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item >
                                            {
                                                this.state.tasks.map((task, index) => {
                                                    if (index === 0)
                                                        return;
                                                    return (
                                                        <a id={"task_" + index} className="dropdown-item" href="#">{index}. {task.title}</a>
                                                    )
                                                })
                                            }
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>


                        </div>
                        <div className="row mb-4 justify-content-center align-items-center">
                            <div className="col  d-flex justify-content-center">

                                <button type="button" onClick={this.csvClicked.bind(this)} className="btn mr-2 col col-sm-auto btn-primary float-right mb-3 " data-dismiss="modal" >
                                    <svg className="bi bi-cloud-upload mr-2" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4.887 6.2l-.964-.165A2.5 2.5 0 1 0 3.5 11H6v1H3.5a3.5 3.5 0 1 1 .59-6.95 5.002 5.002 0 1 1 9.804 1.98A2.501 2.501 0 0 1 13.5 12H10v-1h3.5a1.5 1.5 0 0 0 .237-2.981L12.7 7.854l.216-1.028a4 4 0 1 0-7.843-1.587l-.185.96z" />
                                        <path fillRule="evenodd" d="M5 8.854a.5.5 0 0 0 .707 0L8 6.56l2.293 2.293A.5.5 0 1 0 11 8.146L8.354 5.5a.5.5 0 0 0-.708 0L5 8.146a.5.5 0 0 0 0 .708z" />
                                        <path fillRule="evenodd" d="M8 6a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8A.5.5 0 0 1 8 6z" />
                                    </svg>
          Download CSV</button>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default Export;
