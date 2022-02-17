import React from 'react';
import './Welcome.css';

function Welcome(props) {
  return (
    <div className="welcome-container" ref={props.innerRef}>
      <h1>Welcome to PayPerRead!</h1>
      <p>Built For Writers Making A Living</p>
    </div>
  );
}

export default Welcome;
