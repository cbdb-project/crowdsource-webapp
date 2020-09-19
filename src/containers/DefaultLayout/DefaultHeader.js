import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Nav, NavItem } from 'reactstrap';
import PropTypes from 'prop-types';

import { AppSidebarToggler } from '@coreui/react';
// import logo from '../../assets/img/brand/logo.svg'
// import sygnet from '../../assets/img/brand/sygnet.svg'
import { useLocation } from 'react-router-dom'

import { Can } from '@casl/react'

const { Ability } = require('@casl/ability');
const { unpackRules } = require('@casl/ability/extra');

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

function LoginRedirect(props) {
  var location = useLocation();

  if (this.location.pathname.endsWith("/login") && this.props.user) {
    this.props.history.push('/')
    return <div></div>
  }
  return <div></div>

}

class DefaultHeader extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userAbility: new Ability(),
      navBar: {}
    };
  }

  async componentWillMount() {

  }


  async componentWillUpdate() {

  }

  navClicked(item) {
    const nav = {}
    nav[item] = true;
    this.setState({navBar: nav})
  }

  
  navStyle(item) {
    return(this.state.navBar[item] == true ? "nav-active" : "")
  }


  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props;
    var userInfo;

    const userAbility = this.state.userAbility;

    if (this.props.user) {
      console.log("User info exists. Rendering based on permissions.");
      userInfo = <div> {this.props.user.email} | <a href="#" onClick={this.props.handleLogout}>logout</a></div>
      this.props.client.service('abilities').get(this.props.user.id).then(packedRules => {
        console.log("abilities ...");
        console.log(packedRules);
        userAbility.update(unpackRules(packedRules))
      })

    }
    // } else {
    //   console.log("User not exists. No navigation");

    //   return (
    //     <React.Fragment></React.Fragment>
    //   )
    //   // userInfo = <div> <a href="/login"></a></div>
    // }

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        {/* <AppNavbarBrand
          full={{ src: logo, width: 89, height: 25, alt: 'CoreUI Logo' }}
          minimized={{ src: sygnet, width: 30, height: 30, alt: 'CoreUI Logo' }}
        /> */}
        {/* <AppSidebarToggler className="d-md-down-none" display="lg" /> */}

        <Nav className="d-md-down-none" navbar>
          <Can I="get" a="tasks" ability={userAbility}>
            <NavItem className={"px-3 "+ this.navStyle("collab")} onClick={this.navClicked.bind(this, "collab")}>
              <NavLink to="/collab" className="nav-link">Work on tasks</NavLink>
            </NavItem>
          </Can>
          <Can I="manage" a="tasks" ability={userAbility}>
          <NavItem className={"px-3 "+ this.navStyle("proposals")} onClick={this.navClicked.bind(this, "proposals")}>
              <Link to="/proposals" className="nav-link">Review proposals</Link>
            </NavItem>
          </Can>
          <Can I="manage" a="tasks" ability={userAbility}>
          <NavItem className={"px-3 "+ this.navStyle("import")} onClick={this.navClicked.bind(this, "import")}>
              <Link to="/import" className="nav-link">Import a task</Link>
            </NavItem>
          </Can>
          <Can I="get" a="tasks" ability={userAbility}>
          <NavItem className={"px-3 "+ this.navStyle("export")} onClick={this.navClicked.bind(this, "export")}>
              <Link to="/export" className="nav-link">Export task data</Link>
            </NavItem>
          </Can>
          <Can I="manage" a="tasks" ability={userAbility}>
          <NavItem className={"px-3 "+ this.navStyle("tasks")} onClick={this.navClicked.bind(this, "tasks")}>
              <Link to="/tasks" className="nav-link">Manage tasks</Link>
            </NavItem>
          </Can>
          <Can I="manage" a="users" ability={userAbility}>
          <NavItem className={"px-3 "+ this.navStyle("users")} onClick={this.navClicked.bind(this, "users")}>
              <Link to="/users" className="nav-link">Manage users</Link>
            </NavItem>
          </Can>
        </Nav>
        <Nav className="ml-auto mr-3" navbar>


          {userInfo}


        </Nav>
        {/* <AppAsideToggler className="d-md-down-none" /> */}
        {/*<AppAsideToggler className="d-lg-none" mobile />*/}
      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
