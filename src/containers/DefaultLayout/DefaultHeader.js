import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {  Nav, NavItem } from 'reactstrap';
import PropTypes from 'prop-types';

import { AppSidebarToggler } from '@coreui/react';
// import logo from '../../assets/img/brand/logo.svg'
// import sygnet from '../../assets/img/brand/sygnet.svg'
import { useLocation } from 'react-router-dom'

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
    this.state = {};
  }

  async componentWillMount() {
  
  }

  
  async componentWillUpdate() {
    
  }

  
  render() {
    // eslint-disable-next-line
    const { children, ...attributes } = this.props;
    var userInfo;
    

    if (this.props.user) {
      console.log("User info exists. Show logout");
      userInfo = <div> {this.props.user.email} | <a href="#" onClick={this.props.handleLogout}>logout</a></div>
    } else {
      console.log("User not exists. No logout");
      userInfo = <div> <a href="/login"></a></div>
    }

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        {/* <AppNavbarBrand
          full={{ src: logo, width: 89, height: 25, alt: 'CoreUI Logo' }}
          minimized={{ src: sygnet, width: 30, height: 30, alt: 'CoreUI Logo' }}
        /> */}
        {/* <AppSidebarToggler className="d-md-down-none" display="lg" /> */}

        <Nav className="d-md-down-none" navbar>
          <NavItem className="px-3">
            <NavLink to="/collab" className="nav-link">Work on task</NavLink>
          </NavItem>
          <NavItem className="px-3">
            <Link to="/proposals" className="nav-link">Review proposals</Link>
          </NavItem>
          <NavItem className="px-3">
            <Link to="/import" className="nav-link">Import task</Link>
          </NavItem>
          <NavItem className="px-3">
            <Link to="/export" className="nav-link">Export</Link>
          </NavItem>
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
