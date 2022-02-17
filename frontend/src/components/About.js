import React from 'react';
import './About.css';

function About(props) {
  const { innerRef } = props;

  return (
    <div className="about-container" ref={innerRef}>
      <h1>How does it work?</h1>
      <div className="about-wrapper">
        <div className="about-box-1">
          <h1> Pay For What You Read </h1>
          <p>PayPerRead aims to solve profitablity for journalists and bloggers.</p>
          <p>Paying monthly for a subscription can feel annoying/expensive and Ads can ruin a reading experience. </p>
        </div>
        <div className="about-box-2">
          <h1> Manage Articles Here </h1>
          <p>Users may visit this website to view account settings, add funds, or manage articles.</p>
          <p>Publishers are able to view profits and transfer funds to their accounts.</p>
        </div>
        <div className="about-box-2">
          <h1> Iframe-Based </h1>
          <p>Implement our API onto your website! Our platform comes in the form of an Iframe for convenience.  </p>
          <p>Readers may login or create an account through Google to buy an article(s).</p>
        </div>
      </div>
    </div>
  );
}

export default About;
