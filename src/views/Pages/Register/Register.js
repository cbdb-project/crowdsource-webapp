import React, { Component } from 'react';
import { Button, Card, CardBody, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';


import createFeathersClient from '@feathersjs/feathers'
import auth from '@feathersjs/authentication-client'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'
const SERVER = 'http://' + window.location.hostname + ':5000'
const socket = io(SERVER);
const feathers = createFeathersClient()
// const client = feathers();

feathers.configure(socketio(socket))
feathers.configure(
  auth({
    storage: window.localStorage,
    storageKey: 'access-token',
    path: '/authentication'
  })
)


class Register extends Component {
  
  handleSubmit(evt) {
    feathers.service('users').create({
      nickname: this.state.nickname,
      email: this.state.email,
      password: this.state.password,
    })
    this.props.history.push('/login?status=reg')
  }

  handleChange(event) {
    var p = {
    };
    p[event.target.id] = event.target.value;
    this.setState(p);
  }
  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="9" lg="7" xl="6">
              <Card className="mx-4">
                <CardBody className="p-4">
                  <Form onSubmit={this.handleSubmit.bind(this)}>
                    <h1>Register</h1>
                    <p className="text-muted">Create your account</p>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" id="email" onChange={this.handleChange.bind(this)} placeholder="Email" autoComplete="username" />
                    </InputGroup>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" id="nickname" onChange={this.handleChange.bind(this)} placeholder="Nickname" autoComplete="username" />
                    </InputGroup>
                   
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" id="password" onChange={this.handleChange.bind(this)}  placeholder="Password" autoComplete="new-password" />
                    </InputGroup>
                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="icon-lock"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" id="password" onChange={this.handleChange.bind(this)} placeholder="Repeat password" autoComplete="new-password" />
                    </InputGroup>
                    <Button color="success" block>Create Account</Button>
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
