import React, { Component } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultFooter extends Component {
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <span><a href="https://coreui.io">CBDB Crowdsourcing App</a> &copy; 2020 CBDB Project <a href="https://github.com/cbdb-project/crowdsource-webapp" target="_blank">GitHub</a></span>
        <span className="ml-auto">Based on <a href="https://projects.iq.harvard.edu/cbdb">CBDB Project</a></span>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
