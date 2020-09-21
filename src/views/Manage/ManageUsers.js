import React, { Component, Fragment } from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { Table } from 'reactstrap';
// import { CircleXIcon } from 'react-open-iconic-svg';
import { XCircleFillIcon } from '@primer/octicons-react'
import Modal from 'react-modal';


class ManageUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
        }
    }

    async componentWillMount() {
        console.log("Loading users ...");
        await this.loadUsers();

        Modal.setAppElement('body')
        console.log(this.state.users);
    }

    async loadUsers() {
        const users = await this.props.client.service('users').find({});
        this.setState({ users: users })
        if (users.length === 0) {
            console.log("No users found!");
        }
    }


    async handleDelete() {
        const id = this.state.toDelete;
        console.log("handleDelete: " + this.state.toDelete);
        var r = await this.props.client.service('users').remove(id);
        this.toggleDelete(null, true);
        await this.loadUsers();
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
    renderUsers() {
        if (this.state.users.length == 0) {
            return (
                <div className="ml-2 mt-2 mb-2"> No users found. </div>
            )
        } else {
            return (
                <Table hover responsive className="table-outline  data-table align-bottom mb-0 d-none d-sm-table">
                    <thead className="">
                        <tr>
                            <th>User ID</th>
                            <th>Email</th>
                            <th>Nickname</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>

                        {
                            this.state.users.map((user, index) => {
                                console.log("curr user ...");
                                console.log(user);
                                return (
                                    <tr key={"t_" + user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.email}</td>
                                        <td>{user.nickname}</td>
                                        <td className="text-right">{this.renderActionsFor(user.id)}</td>
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
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)'
            }
        };
        return (

            <Modal isOpen={this.state.confirmDeleteShow} className="confirm-dialog">
                <div className="modal-header">
                    Delete user
            </div>
                <div className="modal-body">
                    Are you sure you want to delete the user? All proposals associated with this task will also be deleted.
            </div>
                <div className="modal-footer">
                    <button type="button" className="lite-button btn-default" data-dismiss="modal" onClick={this.toggleDelete.bind(this, 1, true)}>Cancel</button>
                    <button className="lite-button btn-danger btn-ok" onClick={this.handleDelete.bind(this)}>Delete</button>
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
                        {this.renderUsers()}
                    </Card.Body>
                </Card>
            </div>


        )
    }
}

export default ManageUsers;
