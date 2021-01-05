import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardGroup, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row } from 'reactstrap';
import { Redirect } from 'react-router-dom'

import { parse } from 'query-string';

import {http_protocol, port_number} from '../../../config.js';

const feathers = require('@feathersjs/feathers')
const auth = require('@feathersjs/authentication-client');

const socketio = require('@feathersjs/socketio-client');
const SERVER = http_protocol + '://' + window.location.hostname + ':5000';

const io = require('socket.io-client');

const socket = io(SERVER, {withCredentials: true});

// const client = feathers()
// client.configure(socketio(socket));


class LoginMessage extends Component {
  static Registered = "Registered successfully! Please login with your credentials.";
  static InvalidLogin = "Invalid username / password. Try again."
  render() {

    if (this.props.status === "reg")
      return (
        <div className="alert alert-success">{LoginMessage.Registered}</div>
      )
    
    //   return <div className="alert alert-warning">{LoginMessage.InvalidLogin}</div>
    // else if (this.props.status === "error") 
    if (this.props.msg  ) 
      return <div className="alert alert-warning">{this.props.msg}</div>
    
    return <div></div>
  }
}
class Login extends Component {

  componentWillMount() {
    this.setState({});
  }
  

  async handleSubmit() {

    console.log("Login::handleSubmit()");
    console.log("credentials: " + this.state.email + " / " + this.state.password)
    var client = this.props.client;

    try {
      client.configure(
        auth({
          storage: window.localStorage,
          storageKey: 'auth-token',
          path: '/authentication'
        })
      )
      const { accessToken, user } = await client.authenticate({
        strategy: 'local',
        email: this.state.email,
        password: this.state.password
      })
      console.log("authenticated!");
      console.log(accessToken);
      this.props.onLogin(client, user);
      localStorage.setItem('auth-token', accessToken);


    } catch (e) {
      console.log("Login Error!")
      console.log(e);
      this.setState({errorMsg: e.toString()});
      return;
    }

    this.props.history.push('/collab')

  }

  handleChange(event) {
    var p = {
    };
    p[event.target.id] = event.target.value;
    this.setState(p);
  }
  render() {

    const { location: { search } } = this.props;
    const { status } = parse(search);


    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <LoginMessage status={status} msg={this.state.errorMsg}></LoginMessage>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form >
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" id="email" onChange={this.handleChange.bind(this)} placeholder="Email" autoComplete="username" />
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" id="password" onChange={this.handleChange.bind(this)} placeholder="Password" autoComplete="current-password" />
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <button className="lite-button-bordered px-4" onClick={this.handleSubmit.bind(this)} color="primary" >Login</button>
                        </Col>
                        <Col xs="6" className="text-right">
                          {/* <Button color="link" className="px-0">Forgot password?</Button> */}
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                <Card className="text-white bg-primary py-5 d-md-down-none" style={{ width: '44%' }}>
                  <CardBody className="text-center">
                    <div>
                      <h2>Sign up</h2>
                      <p>Create a Crowdsourcing Platform for Associations(CSA) account.</p>
                      <Link to="/register">
                        <button className="lite-button-inverse mt-3"   active tabIndex={-1}>Register Now!</button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Login;
