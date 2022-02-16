import React from 'react';
import { ButtonPublisherSignIn } from './ButtonPublisherSignIn';
import { ButtonReaderSignIn } from './ButtonReaderSignIn';
import './Welcome.css';

function Welcome() {
  return (
    <div className="welcome-container">
      <h1>Welcome to PayPerRead!</h1>
      <p>Built For Writers Making A Living</p>
      <div>
        <ButtonReaderSignIn
          className="btns"
          buttonStyle="btn--outline"
          buttonSize="btn--large"
        >
          Login for Readers
        </ButtonReaderSignIn>
        <ButtonPublisherSignIn
          className="btns"
          buttonStyle="btn--outline"
          buttonSize="btn--large"
        >
          Login For Publishers
        </ButtonPublisherSignIn>
      </div>
    </div>
  );
}

export default Welcome;
