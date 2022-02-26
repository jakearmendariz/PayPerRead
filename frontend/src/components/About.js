import React from 'react';
import './css/About.css';

function About(props) {
  const { innerRef } = props;

  return (
      <div className="container" ref={innerRef}>
        <div className="row">
          <h1 style={{fontSize:"3.5rem"}} className="fuckshit">How PayPerRead Works</h1>
          <div className="col">
            <p>
            PayPerRead works as a virtual wallet for consumers and a webservice for publishers to add to their site in order to generate revenue.
            Sites with PayPerRead embedded in them can charge viewer's of their site a small fee to own access to that page.
            </p>
            <p>
            Users add money to their account once, and be able to visit a variety of websites, only paying for the content
            they actually read. No advertising, no subscriptions to worry about, only paying creators for the content you enjoy.
            </p>
          </div>
        </div>

        <div className="row">
          <br></br>
        </div>
        <div className="row">
          <h1>What We Provide</h1>
          <div className="col-sm-4">
            <h3>Pay Only For What You Read</h3>
            <p>Readers only pay for the articles that interest them, no subscriptions or hidden fees!</p>
            <p>Once you buy it, you own it in perpetuity throughout the universe.</p>
          </div>
          <div className="col-sm-4">
            <h3>Manage Account Here</h3>
            <p>Users can add money to their accout and view their purchase history.</p>
            <p>Publishers can deposit money, view analytics of their articles to understand their revenue.</p>
          </div>
          <div className="col-sm-4">
            <h3>Honest way to Generate Revenue</h3>
            <p>
              By only charging readers per artilces, publishers get paid for page views. They don't have to
              worry about going viral or getting people to subscribe to their site. Each time reader comes back
              they can generate revenue.
            </p>
          </div>
        </div>
      </div>
  );
}

export default About;
