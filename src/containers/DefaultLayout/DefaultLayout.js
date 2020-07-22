import React, { Component, Fragment, Suspense } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import * as router from 'react-router-dom';
import { Container } from 'reactstrap';
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

const socket = io('http://' + window.location.hostname + ':5000');
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

  async auth(user) {
    console.log("auth()");
    try {
      // First try to log in with an existing JWT
      if (!user)  {
        user = (await client.reAuthenticate()).user;
        console.log("Reauth success!")
      } else {
        console.log("Auth with login success!")
      }
      console.log(user);

    } catch (error) {
      console.log(error);
      // console.log(await client.authentication.removeAccessToken());
      if (!this.props.history)
        this.props.history = [];
      console.log(this.props.history);
      this.props.history.push('/login')
      return;
    }
    if (user) this.setState({ user: user });
  }

  redirectLogin() {
    if (!this.props.history)
      this.props.history = [];
    this.props.history.push('/login')
  }

  async handleLogout() {
    // await client.removeAccessToken();
    await client.logout();

    console.log("token removed!");

    this.setState({ user: null });
    console.log("logged out!!");
    this.redirectLogin();

  }

  onLogin(user) {
    
  }

  render() {

    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader handleLogout={this.handleLogout.bind(this)} user={this.state.user} client={client} />
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
                          props.onLogin = this.auth.bind(this);
                          props.client = client;
                          return (
                            <route.component {...props} />
                          )
                        }
                        } />
                    ) : (null);
                  })}
                  {(!this.state.user) ?
                    (<Redirect from="/" to="/login"/>) :
                    (<Fragment></Fragment>)}
                  <Redirect from="/" to="/collab" user={this.state.user} client={client} />
                  
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
