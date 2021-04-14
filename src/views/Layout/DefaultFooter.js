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
        <span>Crowdsourcing System for Association Data &copy; 2021 <a href="https://cbdb.fas.harvard.edu/" target="_blank">CBDB</a> | <a href="https://github.com/cbdb-project/crowdsource-webapp" target="_blank">GitHub</a> | in Collaboration with the <a href="https://ccs.ncl.edu.tw/expertDB5.aspx" target="_blank">Center for Chinese Studies</a></span>
        <span className="ml-auto">Content on <a href="https://csa.cbdb.fas.harvard.edu:81/" target="_blank">CSA</a> is licensed under a <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" target="_blank">CC BY-NC-ND 4.0 </a> License</span>
      </React.Fragment>
    );
  }
}

DefaultFooter.propTypes = propTypes;
DefaultFooter.defaultProps = defaultProps;

export default DefaultFooter;
