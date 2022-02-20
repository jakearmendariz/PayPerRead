import React from 'react';
import PropTypes from 'prop-types';
import './Welcome.css';

function Welcome(props) {
  const { innerRef } = props;

  return (
    <div className="welcome-container" ref={innerRef}>
      <h1>Welcome to PayPerRead!</h1>
      <p>Built For Writers Making A Living</p>
    </div>
  );
}

Welcome.propTypes = {
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};

export default Welcome;
