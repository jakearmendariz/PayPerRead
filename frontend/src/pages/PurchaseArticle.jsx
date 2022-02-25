import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setIsIframe } from '../redux/slice';

// send message to parent about article purchase status
const postPurchaseStatus = (s) => {
  window.parent.postMessage({ message: s }, 'http://localhost:3001');
};

const ownsArticle = (state) => {
  if (state.guid) {
    fetch(`http://localhost:8000/articles/own/${state.guid}`, {
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status === 200) postPurchaseStatus('success');
      });
  }
};

const setArticleState = (state, setState, email, articleId) => {
  fetch(`http://localhost:8000/articles/${articleId}?email=${email}`)
    .then((resp) => {
      if (resp.status === 200) {
        resp.json().then((article) => {
          console.log(article);
          const update = article.price.dollars + article.price.cents / 100.0;
          if (update !== state.articlePrice) {
            setState({
              guid: article.guid,
              articleTitle: article.article_name,
              articlePrice: update,
              loggedin: state.loggedin,
            });
          }
        });
      }
    });
};

const isLoggedin = (state, setState) => {
  if (!state.loggedin) {
    fetch('http://localhost:8000/cookies', {
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status === 200) {
          setState({
            guid: state.guid,
            articleTitle: state.articleTitle,
            articlePrice: state.articlePrice,
            loggedin: true,
          });
        }
      });
  }
};

function PurchaseArticle() {
  const { email, id } = useParams();
  const [state, setState] = useState({
    guid: undefined, articleTitle: '', articlePrice: 0.00, loggedin: false,
  });

  const dispatch = useDispatch();

  // check if the user owns the article,
  // if not logged in direct them to signin
  useEffect(() => {
    dispatch(setIsIframe({ isIframe: true }))
    isLoggedin(state, setState);
    if (state.loggedin) {
      setArticleState(state, setState, email, id);
      ownsArticle(state);
    }
  });

  const purchaseArticle = () => {
    fetch(`http://localhost:8000/articles/purchase/${email}/${id}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status === 200) postPurchaseStatus('success');
      });
  };

  if (state.loggedin) {
    return (
      <div className="text-center">
        <h1>{state.articleTitle}</h1>
        <h2>
          $
          {state.articlePrice}
        </h2>
        <button type="submit" onClick={purchaseArticle}>Purchase</button>
      </div>
    );
  }
  return (
    <div className="text-center">
      <h2>You need to create an account with PayPerRead to read this article.</h2>
      <p>
        Click
        {' '}
        <a href="http://localhost:3000/signin/reader" target="blank">here</a>
        {' '}
        to make your account.
      </p>
    </div>
  );
}

export default PurchaseArticle;
