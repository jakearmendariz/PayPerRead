import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// <iframe src="http://localhost:3000/purchase/uiafjdkahfueh" />

// send message to parent about article purchase status
const postPurchaseStatus = (s) => {
  window.parent.postMessage({ message: s }, "http://localhost:3001");
};

const ownsArticle = (publisher_email, id) => {
  fetch(`http://localhost:8000/articles/own/${publisher_email}@:${id}`, {
    credentials: 'include',
  })
    .then((resp) => {
      if (resp.status == "200")
        postPurchaseStatus("success");
    })
}
const setArticleState = (state, setState, publisher_email, id) => {
  fetch(`http://localhost:8000/articles/${publisher_email}@:${id}`)
      .then((resp) => {
        if (resp.status == "200")
          resp.json().then(article => {
            console.log(article);
            const update = article['price']['dollars'] + article['price']['cents']/100.0;
            if (update != state.articlePrice) {
              setState({ approved: state.approved, articleTitle: article['article_name'], articlePrice: update, loggedin: state.loggedin })
            }
            // setState({ approved: state.approved, articleTitle: article['article_name'], articlePrice: update, loggedin: state.loggedin })
            console.log(state.articlePrice);
          });

      })
}

const isLoggedin = (state, setState) => {
  if (!state.loggedin) {
    fetch(`http://localhost:8000/cookies`, {
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status == "200") {
          setState({ approved: state.approved, articleTitle: state.articleTitle, articlePrice: state.articlePrice, loggedin: true })
        }
      });
  }

}

function PurchaseArticle() {

  const navigate = useNavigate();
  const { id } = useParams();
  const publisher_email = "xyan87@ucsc.edu"
  const [state, setState] = useState({ approved: false, articleTitle: "", articlePrice: 0.00, loggedin: false });

  // check if the user owns the article,
  // if not logged in direct them to signin
  useEffect(() => {
    isLoggedin(state, setState);
    if (state.loggedin) {
      ownsArticle(publisher_email, id);
      setArticleState(state, setState, publisher_email, id);
    }
  });

  const purchaseArticle = () => {

    const payload = {
      publisher_email,
      article_uid: id,
    };

    fetch(`http://localhost:8000/articles/purchase`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    })
      .then((resp) => {
        if (resp.status == 200)
          postPurchaseStatus("success");
      })
  }
  if (state.loggedin) {
    return (
      <div className="text-center">
        <h1>{state.articleTitle}</h1>
        <h2>${state.articlePrice}</h2>
        <button onClick={purchaseArticle}>Purchase</button>
      </div>
    );
  } else {
    return (
      <div className="text-center">
        <h2>You need to create an account with PayPerRead to read this article.</h2>
        <p>Click <a href="http://localhost:3000/signin/reader" target="blank">here</a> to make your account.</p>
      </div>
    );
  }
}

export default PurchaseArticle;

