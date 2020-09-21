import React, { Component, Fragment } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { Table } from 'reactstrap';
// import { CircleXIcon } from 'react-open-iconic-svg';
import { XCircleFillIcon } from '@primer/octicons-react'
import Modal from 'react-modal';

const { convertArrayToCSV } = require('convert-array-to-csv');

class ManageTasks extends Component {
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

    async componentWillMount() {
        console.log("Loading tasks ...");
        await this.loadTasks();

        Modal.setAppElement('body')
        console.log(this.state.tasks);
    }

    async loadTasks() {
        const tasks = await this.props.client.service('tasks').find({});
        this.setState({ tasks: tasks })
        if (tasks.length === 0) {
            console.log("No task found!");
        }
    }


    async handleDelete() {
        const id = this.state.toDelete;
        console.log("handleDelete: " + this.state.toDelete);
        var r = await this.props.client.service('tasks').remove(id);
        this.toggleDelete(null, true);
        await this.loadTasks();
        console.log(r);
    }

    toggleDelete(id = null, close = false) {
        console.log("showing modal")

        if (close) {
            this.setState({ confirmDeleteShow: false })
        } else {
            this.setState({ confirmDeleteShow: true, toDelete: id })
        }
    }

    renderActionsFor(id) {
        return (
            <div>
                <div className="action-icon" onClick={this.toggleDelete.bind(this, id, false)} >
                    <XCircleFillIcon />
                    &nbsp; Delete
                </div>
            </div>
        )
    }
    renderTasks() {
        if (this.state.tasks.length == 0) {
            return (
                <div className="ml-2 mt-2 mb-2"> No tasks found. Try <a href="/#/import">import a new task</a>. </div>
            )
        } else {
            return (
                <Table hover responsive className="table-outline align-bottom mb-0 d-none d-sm-table data-table">
                    <thead className="">
                        <tr>
                            <th>Task ID</th>
                            <th>Task Name</th>
                            <th>Proposals</th>
                            <th>Created by</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {
                            this.state.tasks.map((task, index) => {
                                console.log("curr task ...");
                                console.log(task);
                                return (
                                    <tr key={"t_" + task.id}>
                                        <td>{task.id}</td>
                                        <td>{task.title}</td>
                                        <td>{task.title}</td>
                                        <td>{task.author}</td>
                                        <td className="text-right">{this.renderActionsFor(task.id)}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </Table>


            )
        }



    }
    

    renderConfirmModal() {
        const customStyles = {
            content: {
                top                   : '50%',
                left                  : '50%',
                right                 : 'auto',
                bottom                : 'auto',
                marginRight           : '-50%',
                transform             : 'translate(-50%, -50%)'
            }
        };
        return (

            <Modal isOpen={this.state.confirmDeleteShow} className="confirm-dialog">
                <div className="modal-header">
                    Delete Task
            </div>
                <div className="modal-body">
                    Are you sure you want to delete the task? All proposals associated with this task will also be deleted.
            </div>
                <div className="modal-footer">
                    <button type="button" className="lite-button" data-dismiss="modal" onClick={this.toggleDelete.bind(this, 1, true)}>Cancel</button>
                    <button className=" btn-danger lite-button" onClick={this.handleDelete.bind(this)}>Delete</button>
                </div>

            </Modal>
        )

    }
    render() {
        return (

            <div>
                {this.renderConfirmModal()}

                <Card className="mt-4">
                    <Card.Body>
                        {this.renderTasks()}
                    </Card.Body>
                </Card>
            </div>


        )
    }
}

export default ManageTasks;
