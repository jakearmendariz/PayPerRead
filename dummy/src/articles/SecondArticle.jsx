import React, { useState } from 'react';
import logo from '../logo.svg';
import { PayPerRead } from './PayPerRead';

const ArticleContents = () => (
  <div>
    <p>You just bought access to some premium content. This is just an example showing that our service doesn't put limits on your content. Our github is linked <a href="https://github.com/jakearmendariz/PayPerRead">here</a>.</p>

    <div>
      <span style={{ verticalAlign: "middle" }}>Also, shoutout react.</span>
      <img style={{ verticalAlign: "middle" }} width="64" src={logo} />
    </div>
  </div>
);

function SecondArticle() {
  // Keeping this outside of the PayPerRead component 
  // in case the publisher wants to show additional components
  // like a model after purchasing.
  const [showArticle, setShowArticle] = useState(false);

  const textCenterStyle = {
    textAlign: "center",
  };
  const centerItemsStyle = {
    display: "flex",
    justifyContent: "center"
  }
  return (
    <div>
      <div style={textCenterStyle}>
        <h2>Premium PayPerRead Content</h2>
        <div style={centerItemsStyle}>
          <PayPerRead
            articleId={"randomstring1"}
            showArticle={showArticle}
            setShowArticle={setShowArticle}
            show
          />
        </div>
      </div>
      {showArticle && <ArticleContents />}
    </div>
  );
}

export default SecondArticle;
