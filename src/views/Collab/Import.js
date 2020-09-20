import React, { Component, Fragment } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import Files from "react-butterfiles";
import axios from 'axios';

const { convertArrayToCSV } = require('convert-array-to-csv');


class Import extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            errors: [],
            message: null,
        }
    }


    async uploadClicked(e) {
        const data = new FormData()
        console.log("Task title: " + this.state.taskName);

        const config = {
            headers: { 'content-type': 'multipart/form-data' },
            params: { title: this.state.taskName }
        }


        data.append('file', this.state.files[0].src.file)
        try {
            await axios.post("http://" + window.location.hostname + ":5000/import", data, config)
            const success = "Task successfully importd!"
            this.setState({ message: success, messageType: "success" })
        } catch (e) {
            this.setState({ message: "Error occurred during import: " + e.toString(), messageType: "error" });

        }

    }

    async componentWillMount() {


    }

    handleSuccess(f) {
        console.log(f);

        this.setState({ files: f });


    }

    handleErrors(e) {
        this.setState({ message: "Error occurred during import: " + e[0].toString(), messageType: "error" });

        console.log(e);
    }


    renderFileUpload() {
        return (
            <Files
                multiple={false} maxSize="10mb" multipleMaxSize="10mb"
                accept={["text/plain","text/x-csv","text/csv","application/x-csv",
                "text/comma-separated-values","text/tab-separated-values","application/csv","application/vnd.ms-excel",".csv", ".txt", ".tsv"]}
                onSuccess={this.handleSuccess.bind(this)}
                onError={this.handleErrors.bind(this)}
            >
                {({ browseFiles, getDropZoneProps }) => {
                    return (
                        <div>
                            <div className="mb-4">
                            Task Name: 
                            <input id="task-name" onChange={this.onChange.bind(this)} type="text" className="form-control" id="taskname" />
                            </div>
                            <label>Drag and drop files.</label>
                            <div
                                {...getDropZoneProps({
                                    style: {
                                        width: 600,
                                        minHeight: 200,
                                        border: "2px lightgray dashed"
                                    }
                                })}
                            >
                                <ol>
                                    {this.state.files.map(file => (
                                        <li key={file.name}>{file.name}</li>
                                    ))}
                                    {this.state.errors.map(error => (
                                        <li key={error.id}>
                                            {error.file ? (
                                                <span>
                                                    {error.file.name} - {error.type}
                                                </span>
                                            ) : (
                                                    error.type
                                                )}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <div>
                                (Alternatively, click {" "}
                                <button onClick={browseFiles}>here</button> to select files.
</div>


                        </div>
                    );
                }}
            </Files>
        )
    }

    onChange(e) {
        this.setState({ taskName: e.target.value });
    }
    renderMessage() {
        if (!this.state.message)
            return null;
        var msgStyle = "alert-success";
        if (this.state.messageType === "error")
            msgStyle = "alert-danger"
        else if (this.state.messageType === "warning")
            msgStyle = "alert-warning"

        return (
            <div className={"alert " + msgStyle}>
                {this.state.message}
            </div>
        )
    }

    render() {
        // this.state.files.map((i) => {console.log(i)});
        return (
            <div  className="container">
                <div className="card mt-4">
                <div className="modal-header">
                        Import task data
                    </div>
                    <div className="card-body">
                        <div className="row mb-4 justify-content-center align-items-center">
                            <div className="col col-3  justify-content-center">
                                {this.renderMessage()}
                            </div>
                        </div>

                        <div className="row mb-4 justify-content-center align-items-center">
                            
                                {this.renderFileUpload()}

                            
                        </div>
                        <div className="row mb-4 justify-content-center align-items-center">
                            <div className="col  d-flex justify-content-center">

                                {this.renderUploadButton()}
                            </div>
                        </div>
                    </div>
                </div >
            </div >

        )
    }
    renderUploadButton() {
        const svg = <svg className="bi bi-cloud-upload mr-2" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.887 6.2l-.964-.165A2.5 2.5 0 1 0 3.5 11H6v1H3.5a3.5 3.5 0 1 1 .59-6.95 5.002 5.002 0 1 1 9.804 1.98A2.501 2.501 0 0 1 13.5 12H10v-1h3.5a1.5 1.5 0 0 0 .237-2.981L12.7 7.854l.216-1.028a4 4 0 1 0-7.843-1.587l-.185.96z" />
            <path fillRule="evenodd" d="M5 8.854a.5.5 0 0 0 .707 0L8 6.56l2.293 2.293A.5.5 0 1 0 11 8.146L8.354 5.5a.5.5 0 0 0-.708 0L5 8.146a.5.5 0 0 0 0 .708z" />
            <path fillRule="evenodd" d="M8 6a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8A.5.5 0 0 1 8 6z" />
        </svg>
        if (this.state.files.length == 0 || !this.state.taskName || this.state.taskName === "") {
            return (
                <button type="button" className="btn mr-2 col col-sm-auto btn-primary float-right mb-3 " disabled>{svg}Upload and import</button>
            )
        } else {
            return (
                <button type="button" onClick={this.uploadClicked.bind(this)} className="btn mr-2 col col-sm-auto btn-primary float-right mb-3 " data-dismiss="modal" >
                    {svg}
                Upload and import </button>
            )
        }

    }
}

export default Import;
