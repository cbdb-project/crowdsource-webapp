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
        <span>Crowdsourcing System for Association Data &copy; 2021 <a href="https://cbdb.fas.harvard.edu/" target="_blank">CBDB Project</a> | <a href="https://github.com/cbdb-project/crowdsource-webapp" target="_blank">GitHub</a> | Collabrating with <a href="https://ccs.ncl.edu.tw/expertDB5.aspx" target="_blank">National Central Library</a></span>
        <span className="ml-auto">Based on <a href="https://projects.iq.harvard.edu/cbdb">CBDB Project</a></span>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
