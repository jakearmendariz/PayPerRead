import React, { useState, useEffect } from 'react';

import logo from './logo.svg';
import './App.css';

const ArticleContents = () => (
    <div>
      <p>Yeah, this is the article</p>
      <img src={logo} />
    </div>
  );

function App() {

  const [ state, setState ] = useState({ approved: false });
  
  const listenForRequest = (e) => {

    console.log(e);
    setState({ approved: false });
  };

  useEffect(() => {
    window.addEventListener("message", listenForRequest);
    return window.removeEventListener("message", listenForRequest);
  }, []);

  
  return (
    <div className="App">
      <h1>Why PayPerRead is Cool</h1>
      { 
        !state.approved &&
        <iframe src="https://payperread.jakearmendariz.repl.co/purchase-article" data-id="test-article-id" />
      }
      { state.approved && <ArticleContents />}
    </div>
  );
}

export default App;
