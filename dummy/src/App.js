import React, { useState, useEffect } from 'react';

import logo from './logo.svg';
import './App.css';

const ArticleContents = () => (
    <div>
      <p>Yeah, this is the article</p>
      <img src="https://i.ytimg.com/vi/317jz-PU7Mg/maxresdefault.jpg" />
    </div>
  );

function App() {

  const [ state, setState ] = useState({ approved: false });
  
  const listenForRequest = (e) => {

    if(e.origin != "http://localhost:3000")
      return;
    if(!e.data.message || e.data.message != "success")
      return;

    setState({ approved: true });
  };

  useEffect(() => {
    window.addEventListener("message", listenForRequest);
    return () => window.removeEventListener("message", listenForRequest);
  }, []);

  
  return (
    <div className="App">
      <h1>Why PayPerRead is Cool</h1>
      { 
        !state.approved &&
          <iframe width="400" height="400" src="http://localhost:3000/purchase/123E5C" />
      }
      { state.approved && <ArticleContents />}
    </div>
  );
}

export default App;
