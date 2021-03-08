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
        <span>Crowdsourcing System for Association Data &copy; 2021 <a href="https://cbdb.fas.harvard.edu/" target="_blank">CBDB Project</a> | <a href="https://github.com/cbdb-project/crowdsource-webapp" target="_blank">GitHub</a> | in Collabration with <a href="https://ccs.ncl.edu.tw/expertDB5.aspx" target="_blank">the National Central Library</a></span>
        <span className="ml-auto">Content on this site is licensed under a <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">CC BY-NC-ND 4.0 </a>International License</span>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
