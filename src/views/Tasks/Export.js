import React, { Component, Fragment } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { DesktopDownloadIcon} from '@primer/octicons-react'

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
                var t = "";
                if (c.hasOwnProperty("c_name_chn")) {
                    t += c.c_name_chn;
                    if (c.hasOwnProperty("c_personid"))
                        t += " (" + c.c_personid + ")";
                    return t;
                } else {
                    return c;
                }

            })
            return row;

        })

    }

    preprocessData(data) {

    }

    _download(strData, strFileName, strMimeType) {
        var D = document,
            a = D.createElement("a");
        strMimeType = strMimeType || "application/octet-stream";
        const universalBOM = "\uFEFF";


        if (navigator.msSaveBlob) { // IE10
            return navigator.msSaveBlob(new Blob([strData], { type: strMimeType }), strFileName);
        } /* end if(navigator.msSaveBlob) */

        
        if ('download' in a) { //html5 A[download]
            a.href = "data:" + strMimeType + "," + encodeURIComponent(universalBOM + strData);
            a.setAttribute("download", strFileName);
            a.innerHTML = "downloading...";
            D.body.appendChild(a);
            setTimeout(function () {
                a.click();
                D.body.removeChild(a);
            }, 66);
            return true;
        } /* end if('download' in a) */


        //do iframe dataURL download (old ch+FF):
        var f = D.createElement("iframe");
        D.body.appendChild(f);
        f.src = "data:" + strMimeType + "," + encodeURIComponent(strData);

        setTimeout(function () {
            D.body.removeChild(f);
        }, 333);
        return true;
    } /* end download() */

    async csvClicked(e) {
        if (!this.state.myTask.data) {
            await this.setTask(this.state.myTask.id);
        }
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
            // var encodedUri = encodeURI(csvContent);
            // window.open(encodedUri, "cbdb-export.csv");
            this._download(s, "cbdb-export.csv", "text/csv");
        } catch (e) {
            console.log(e);
        }
    }

    async setTask(id) {
        const t = await this.props.client.service('tasks').get(id, { query: { perPage: 5000 } });
        console.log(t);
        this.setState({ myTask: t });

    }

    async componentWillMount() {
        console.log("Loading tasks ...");
        const tasks = await this.props.client.service('tasks').find({});
        this.setState({ tasks: tasks })
        if (tasks.length === 0) {
            console.log("No task found!");
            return;
        }
        this.setState({ myTask: this.state.tasks[0] })

    }

    renderTaskDropdown(fn) {
        return (
            <div >
                <select class="task-selector custom-select" id="inputGroupSelect01">
                    {
                        this.state.tasks.length == 0 ? (<option> None </option>) : ""
                    }
                    {
                        this.state.tasks.map((task, index) => {
                            return (
                                <option key={"task_" + task.id} onClick={fn.bind(this, task.id)} >({task.id}) {task.title}
                                </option>
                            )
                        })
                    }
                </select>

            </div>
        )
    }
    render() {
        return (
            <div className="container">
                <div className="rounded-dialog app-card">
                    <div className="modal-header">
                        Export data
                    </div>
                    <div className="modal-body">
                        <div className="row mb-3 justify-content-center align-items-center">
                            <div className="col d-flex justify-content-center">
                                Choose a task below and then click "Download" button.
                </div>
                        </div>
                        <div className="row mb-4 justify-content-center align-items-center">
                            <div className="col  d-flex justify-content-center">
                                {this.renderTaskDropdown(this.setTask.bind(this))}
                            </div>


                        </div>
                        <div className="row mb-4 justify-content-center align-items-center">
                            <div className="col  d-flex justify-content-center">

                                <button type="button" href="#" onClick={this.csvClicked.bind(this)} className="lite-button mr-2 col col-sm-auto float-right mb-3 " data-dismiss="modal" >
                                <DesktopDownloadIcon/>&nbsp; 
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
