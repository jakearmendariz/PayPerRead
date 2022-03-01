import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Button } from 'react-bootstrap';
import { setIsIframe, setLoggedIn } from '../redux/slice';
// send message to parent about article purchase status
const postPurchaseStatus = (s) => {
  window.parent.postMessage({ message: s }, document.referrer);
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
  if (state.loggedin === undefined) {
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
        } else {
          setState({
            guid: state.guid,
            articleTitle: state.articleTitle,
            articlePrice: state.articlePrice,
            loggedin: false,
          });
        }
      });
  }
};

function PaymentButton(props) {
  const { purchaseArticle } = props;
  const [confirmingPayment, setConfirmation] = useState(false);
  const buttonStyle = {
    width: '50%',
    fontSize: '1.2rem',
    backgroundColor: '#00CCF9',
    borderColor: '#00CCF9',
    outline: 'none',
    outlineOffset: 'none',
    padding: '0.5rem',
    margin: '1rem',
  };
  if (!confirmingPayment) {
    return (
      <Button
        style={buttonStyle}
        type="submit"
        onClick={() => setConfirmation(true)}
      >
        Buy Article
      </Button>
    );
  }
  return (
    <Button
      style={buttonStyle}
      type="submit"
      onClick={purchaseArticle}
    >
      Confirm Purchase
    </Button>
  );
}

function PurchaseArticle() {
  // Define parameters and state
  const { email, id } = useParams();
  const [state, setState] = useState({
    guid: undefined, articleTitle: undefined, articlePrice: 0.00, loggedin: undefined,
  });

  // Actions
  const purchaseArticle = () => {
    fetch(`http://localhost:8000/articles/purchase/${email}/${id}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status === 200) postPurchaseStatus('success');
      });
  };

  // Work before rendering
  const dispatch = useDispatch();
  dispatch(setIsIframe({ isIframe: true }));
  // check if the user owns the article,
  // if not logged in direct them to signin
  useEffect(() => {
    if (!state.loggedin) {
      isLoggedin(state, setState);
    }
    if (state.loggedin) {
      dispatch(setLoggedIn({ loggedIn: true }));
      setArticleState(state, setState, email, id);
      ownsArticle(state);
    }
  });
  const buttonStyle = {
    width: '50%',
    fontSize: '1.2rem',
    backgroundColor: '#00CCF9',
    borderColor: '#00CCF9',
    outline: 'none',
    outlineOffset: 'none',
    padding: '0.5rem',
    margin: '1.5rem',
  };
  // Render
  console.log(state.loggedin);
  if (state.loggedin === undefined || state.guid === undefined) {
    if (state.loggedin !== false) {
      return null;
    }
  }
  if (state.loggedin) {
    return (
      <div style={{ margin: '2rem' }} className="text-center">
        <h2 style={{ fontSize: '2.5rem' }}>
          $
          {state.articlePrice}
        </h2>
        <p style={{ fontSize: '1.25rem' }}>
          To continue reading you have to purchase the article
          <br />
          &quot;
          {state.articleTitle}
          &quot;
          <br />
        </p>
        <PaymentButton purchaseArticle={purchaseArticle} />
        <p
          style={{
            marginTop: '1rem', position: 'absolute', bottom: '0', textAlign: 'center',
          }}
          className="text-center"
        >
          Powered by PayPerRead
        </p>
      </div>
    );
  }
  return (
    <div style={{ margin: '2rem' }} className="text-center">
      <h2 style={{ fontSize: '2rem' }}>Hi!</h2>
      <p style={{ fontSize: '1.25rem' }}>This page is requesting a one time fee to read this article.</p>
      <p style={{ fontSize: '1.25rem', marginTop: "1rem"}}>
        To continue you reading, you must make a <a style={{color:"black"}} href="http://localhost:3000">PayPerRead</a> account.
        <br></br>
        <a className="btn btn-primary" target="blank" style={buttonStyle} href="/signin/reader" role="button">Sign Up</a>
      </p>
      <p
          style={{
            marginTop: '1.5rem', position: 'absolute', bottom: '0', textAlign: 'center',
          }}
          className="text-center"
        >
          Powered by PayPerRead
        </p>
    </div>
  );
}

export default PurchaseArticle;
