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
            errors: []
        }
    }


    async uploadClicked(e) {
        const data = new FormData()

        const config = {
            headers: { 'content-type': 'multipart/form-data' }
        }


        data.append('file', this.state.files[0].src.file)
        axios.post("http://localhost:5000/import", data, config)
    }

    async componentWillMount() {


    }

    handleSuccess(f) {
        console.log(f);
        this.setState({ files: f });

    }

    handleErrors(e) {
        console.log(e);
    }


    renderFileUpload() {
        return (
            <Files
                multiple={false} maxSize="10mb" multipleMaxSize="10mb"
                accept={["text/csv", ".csv", ".txt", ".tsv"]}
                onSuccess={this.handleSuccess.bind(this)}
                onError={this.handleErrors.bind(this)}
            >
                {({ browseFiles, getDropZoneProps }) => {
                    return (
                        <div>
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

    render() {
        // this.state.files.map((i) => {console.log(i)});
        return (
            <div>
                <div className="card">
                    <div className="card-header">
                        Import a Task
                    </div>
                    <div className="card-body">
                        <div className="row mb-3 justify-content-center align-items-center">
                            <div className="col d-flex justify-content-center">
                                Upload a CSV file below.
                </div>
                        </div>
                        <div className="row mb-4 justify-content-center align-items-center">
                            <div className="col  d-flex justify-content-center">

                            </div>


                        </div>

                        <div className="row mb-4 justify-content-center align-items-center">
                            <div className="col  d-flex justify-content-center">
                                {this.renderFileUpload()}

                            </div>
                        </div>
                        <div className="row mb-4 justify-content-center align-items-center">
                            <div className="col  d-flex justify-content-center">

                                <button type="button" onClick={this.uploadClicked.bind(this)} className="btn mr-2 col col-sm-auto btn-primary float-right mb-3 " data-dismiss="modal" >
                                    <svg className="bi bi-cloud-upload mr-2" width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4.887 6.2l-.964-.165A2.5 2.5 0 1 0 3.5 11H6v1H3.5a3.5 3.5 0 1 1 .59-6.95 5.002 5.002 0 1 1 9.804 1.98A2.501 2.501 0 0 1 13.5 12H10v-1h3.5a1.5 1.5 0 0 0 .237-2.981L12.7 7.854l.216-1.028a4 4 0 1 0-7.843-1.587l-.185.96z" />
                                        <path fillRule="evenodd" d="M5 8.854a.5.5 0 0 0 .707 0L8 6.56l2.293 2.293A.5.5 0 1 0 11 8.146L8.354 5.5a.5.5 0 0 0-.708 0L5 8.146a.5.5 0 0 0 0 .708z" />
                                        <path fillRule="evenodd" d="M8 6a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0v-8A.5.5 0 0 1 8 6z" />
                                    </svg>
          Upload and import </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default Import;
