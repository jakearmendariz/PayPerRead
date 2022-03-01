import React, { useState, useEffect } from 'react';

import FirstArticle from './articles/FirstArticle';
import SecondArticle from './articles/SecondArticle';

import logo from './logo.svg';
import './App.css';

function Home() {

  return (
    <>
      <p>PayPerRead is a service that helps small publishers and content creators earn more money for their work. This is our blog.</p>
      <p>Click the link at the top right of the page to visit the PayPerRead home page, or click a link at the top left to view our own articles. We hope you enjoy our service.</p>
    </>
  );

}

function App() {

  const [ state, setState ] = useState({ page: (<Home />) });

  const containerStyle = {
    width: "50%",
    marginLeft: "auto",
    marginRight: "auto",
  };

  const cursorStyle = { cursor: "pointer" };
  const linkStyle = { ...cursorStyle, color: "#00f", textDecoration: "underline" };

  const dividerStyle = {
    width: "100%",
    height: "2px",
    backgroundColor: "#ddd",
  };

  return (
      <div style={containerStyle}>
        <h1 style={cursorStyle} onClick={() => setState({ page: (<Home />) })}>PayPerRead Blog</h1>
        <a style={{ float: "right" }} href="http://localhost:3000">PayPerRead Home</a>
        <p style={linkStyle} onClick={() => setState({ page: (<FirstArticle />) })}>• How to use PayPerRead as a Reader</p>
        <p style={linkStyle} onClick={() => setState({ page: (<SecondArticle />) })}>• Premium PayPerRead Content</p>
        <div style={dividerStyle} />

      { state.page }
    </div>

  );

}

export default App;
