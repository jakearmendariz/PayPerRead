import React, { useState } from 'react';
import { PayPerRead } from './PayPerRead';
const ArticleContents = () => (
  <div>
    <p>To start as a reader, you need to create an account on our website and then add money to your account. After, just make sure you are logged in anytime you see our iframe in a website. When you want to access their content, just approve your purchase through the iframe.</p>
    <p>Previously bought articles will automatically be shown to you. This article is behind a paywall, but we've given it to you for free.</p>
    <p>Happy reading!</p>
  </div>
);

function FirstArticle() {
  const [showArticle, setShowArticle] = useState(false);

  const textCenterStyle = {
    textAlign: "center",
  };

  return (
    <div>
      <div style={textCenterStyle}>
        <h2>How to use PayPerRead as a Reader</h2>
        <PayPerRead
          publisherEmail={"dwilby@ucsc.edu"}
          articleId={"randomstring"}
          showArticle={showArticle}
          setShowArticle={setShowArticle}
        />
      </div>
      {showArticle && <ArticleContents />}
    </div>
  );
}

export default FirstArticle;
