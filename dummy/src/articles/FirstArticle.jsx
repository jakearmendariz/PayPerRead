import React, { useState, useEffect } from 'react';

const ArticleContents = () => (
    <div>
      <p>To start as a reader, you need to create an account on our website and then add money to your account. After, just make sure you are logged in anytime you see our iframe in a website. When you want to access their content, just approve your purchase through the iframe.</p>
      <p>Previously bought articles will automatically be shown to you. This article is behind a paywall, but we've given it to you for free.</p>
      <p>Happy reading!</p>
    </div>
  );

function FirstArticle() {
  const [ state, setState ] = useState({ approved: false });
  
  const listenForRequest = (e) => {
    if(e.origin != "http://localhost:3000")
      return;
    if(!e.data.message || !e.data.message.includes("success")) {
      console.log("error from iframe")
      return;
    }
    setState({ approved: true });
  };

  useEffect(() => {
    window.addEventListener("message", listenForRequest);
    return () => window.removeEventListener("message", listenForRequest);
  }, []);


  const textCenterStyle = {
    textAlign: "center",
  };

  const iframeStyle = {
    border: "2px solid #ddd"
  };
  
  return (
    <div>
      <div style={textCenterStyle}>
      <h2>How to use PayPerRead as a Reader</h2>
      { 
        !state.approved &&
          <iframe style={iframeStyle} width="500" height="400" src="http://localhost:3000/purchase/dwilby@ucsc.edu/randomstring" />
      }
      </div>
      { state.approved && <ArticleContents />}
    </div>
  );
}

export default FirstArticle;
