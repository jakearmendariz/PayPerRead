import React from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useCookies } from 'react-cookie';
import './css/Welcome.css';

function Welcome(props) {
  // const [cookies, setCookie] = useCookies();
  // USED BY (VOX.com. MEDIUM)
  const { innerRef } = props;
  return (
    <div className="welcome-container" ref={innerRef}>
      <h1>Pay Only For What You Read</h1>
      <p>Trusted by Medium, Vox, NyTimes and the WallStreet Journal</p>
      <a className="btn btn-primary" href="/signin/reader" role="button">Get Started</a>

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
