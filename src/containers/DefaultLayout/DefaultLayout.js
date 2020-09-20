import React, { Component, Fragment, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';
import { useLocation } from 'react-router-dom'

import {
  AppAside,
  AppFooter,
  AppHeader,
  AppBreadcrumb2 as AppBreadcrumb,

} from '@coreui/react';
// sidebar nav config
// import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import auth from '@feathersjs/authentication-client'

const io = require('socket.io-client');
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');

const SERVER = 'http://' + window.location.hostname + ':5000'

const socket = io(SERVER);
const client = feathers();

client.configure(socketio(socket));
client.configure(
  auth({
    storage: window.localStorage,
    storageKey: 'auth-token',
    path: '/authentication'
  })
)

const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));
// let location = useLocation();
class DefaultLayout extends Component {

  constructor(props) {
    super(props);
    
    this.state = { client: client };

  }
  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  async componentWillMount() {
    await this.auth();
  }

  async componentWillUpdate() {
    // await this.auth();
  }

  async auth() {
    console.log("DefaultLayout::auth()");
    var user;
    try {
      // First try to log in with an existing JWT
      user = (await client.reAuthenticate()).user;
      console.log("Reauth success!")
      console.log(user);
      
    } catch (error) {
      console.log("Reauth failed. Error below.");
      console.log(error);
      console.log(await client.authentication.removeAccessToken());
      this.redirectLogin();
      return;
      // if (!this.props.history)
      //   this.props.history = [];
      // console.log(this.props.history);
      // this.props.history.push('/login')
      // return;
    }
    if (!user) {
      this.redirectLogin();
      return;
    }
    // if (!user && this.props.location.pathname!=="/login" && this.props.location.pathname!=="/register" ) {
    //   console.log("Need login first");
    //   console.log(this.props.location.pathname);
    //   return (
    //     (<Redirect to="/login" user={this.state.user} client={this.state.client} />)
    //   )
    // }
    this.setState({ user: user });
    
  }

  redirectLogin() {
    console.log("DefaultLayout:: redirectLogin()");
    if (!this.props.history)
      this.props.history = [];
    this.props.history.push('/login')
  }

  renderOrLogin() {

  }

  async handleLogout() {
    // await client.removeAccessToken();
    this.setState({ user: null });
    await client.logout();
    this.redirectLogin();
    console.log("token removed! logged out.");
  }

  onLogin(client, user) {
    console.log("DefaultLayout: on login called. Setting client.");
    this.setState({ client: client, user: user })
  }



  componentDidMount() {

  }

  render() {
    
    return (
      <div className="app">
        
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader handleLogout={this.handleLogout.bind(this)} user={this.state.user} client={this.state.client} />
          </Suspense>
        </AppHeader>
        <div className="app-body pt-2">
          {/* <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <Suspense>
            <AppSidebarNav navConfig={navigation} {...this.props} router={router}/>
            </Suspense>
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar> */}
          <main className="main">
            {/* <AppBreadcrumb appRoutes={routes} router={router}/> */}
            <Container fluid>
              <Suspense fallback={this.loading()}>
                <Switch>


                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}

                        render={props => {
                          props.user = this.state.user;
                          props.onLogin = this.onLogin.bind(this);
                          props.auth = this.auth.bind(this);
                          props.client = this.state.client;
                          return (
                            <route.component {...props} />
                          )
                        }
                        } />
                    ) : (null);
                  })}
        (<Redirect from="/" to="/collab" user={this.state.user} client={this.state.client} />)

                </Switch>
              </Suspense>
            </Container>
          </main>
          <AppAside fixed>
            <Suspense fallback={this.loading()}>
              <DefaultAside />
            </Suspense>
          </AppAside>
        </div>
        <AppFooter>
          <Suspense fallback={this.loading()}>
            <DefaultFooter />
          </Suspense>
        </AppFooter>
      </div>
    );
  }
}

export default DefaultLayout;
