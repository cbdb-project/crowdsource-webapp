import React, { Component } from 'react';
import { Button, Card, CardBody, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import { HubotIcon, MailIcon } from '@primer/octicons-react'


import createFeathersClient from '@feathersjs/feathers'
import auth from '@feathersjs/authentication-client'
import socketio from '@feathersjs/socketio-client'
// import io from 'socket.io-client'
const SERVER = 'http://' + window.location.hostname + ':5000'
const io = require('socket.io-client')(SERVER, {cors: {origin: '*',}});
// const socket = io(SERVER);
const feathers = createFeathersClient()
// const client = feathers();

feathers.configure(socketio(io))
feathers.configure(
  auth({
    storage: window.localStorage,
    storageKey: 'access-token',
    path: '/authentication'
  })
)


class Register extends Component {


  componentWillMount() {
    this.setState({});
  }
  async handleSubmit(evt) {
    console.log("Creating user ...")
    try {
      await feathers.service('users').create({
        nickname: this.state.nickname,
        email: this.state.email,
        password: this.state.password,
      })
    } catch (e) {
      console.log(e);
      this.setState({ errorMsg: e.toString() });
      return;
    }

    this.props.history.push('/login?status=reg')
  }

  handleChange(event) {
    var p = {
    };
    p[event.target.id] = event.target.value;
    this.setState(p);
  }
  render() {
    var error = this.state.errorMsg ? (<div className="alert alert-warning"><Row className="justify-content-center">
      <Col md="8">
        {this.state.errorMsg}
      </Col>
    </Row></div>): "";
    return (
      <div className="app flex-row align-items-center">
        <Container>
          
          <Row className="justify-content-center">

            <Col md="9" lg="7" xl="6">
              <Card className="mx-4">
                <CardBody className="p-4">
                  <Form onSubmit={this.handleSubmit.bind(this)}>
                    <div> {error}</div>
                    <h1>Register</h1>

                    <p className="text-muted">Create your account</p>
                    <div className="mb-4">
                      <input className="line-input-lt w-100" type="text" id="email" onChange={this.handleChange.bind(this)} placeholder="Email" autoComplete="username" />
                    </div>
                    <div className="mb-4">
                      <input className="line-input-lt w-100" type="text" id="nickname" onChange={this.handleChange.bind(this)} placeholder="Nickname" autoComplete="username" />
                    </div>
                    <div className="mb-4">
                      <input className="line-input-lt w-100" type="password" id="password" onChange={this.handleChange.bind(this)} placeholder="Password" autoComplete="new-password" />
                    </div>
                    <div className="mb-4">
                      <input className="line-input-lt w-100" type="password" id="password" onChange={this.handleChange.bind(this)} placeholder="Repeat password" autoComplete="new-password" />
                    </div>
                    <div className="modal-footer">
                      <button className="lite-button" >Create Account</button>
                    </div>
                  </Form>
                </CardBody>

              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Register;
