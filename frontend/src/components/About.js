import React from 'react';
import './css/About.css';

function About(props) {
  const { innerRef } = props;

  return (
    <div className="container" ref={innerRef}>
      <div className="row">
        <h1 style={{ fontSize: '3.5rem' }}>How PayPerRead Works</h1>
        <div className="col">
          <p>
            PayPerRead acts as a virtual wallet and a webservice to allow secure purchasing and ownership of articles across
            third party sites. Sites with PayPerRead embedded in them can charge viewer's of their site a small fee
            to own access to that page.
          </p>
          <p>
            Users can add money to their account once, and can now purchase articles at any website supporting PayPerRead.
            No more advertising or subscriptions, only paying creators for the content you enjoy.
          </p>
        </div>
      </div>

      <div className="row">
        <br />
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
          <p>Publishers can view analytics of their articles, deposit money and use our api to register articles.</p>
        </div>
        <div className="col-sm-4">
          <h3>Honest Source of Revenue</h3>
          <p>
            Publishers don't have to
            worry about going viral or getting users to subscribe to their site.
          </p>
          <p>
            A fair and small price
            for access to a site empowers users and publishers alike.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
