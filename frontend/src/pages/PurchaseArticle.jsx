import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { setIsIframe, setLoggedIn, selectLoggedIn } from '../redux/slice';
import { Button } from 'react-bootstrap';
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
              loading: state.loading,
              loadingCount: state.loadingCount + 1,
            });
          }
        });
      }
    });
};

const isLoggedin = (state, setState) => {
  if (state.loggedin == undefined) {
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
            loading: state.loading,
            loadingCount: state.loadingCount + 1
          });
        } else {
          setState({
            guid: state.guid,
            articleTitle: state.articleTitle,
            articlePrice: state.articlePrice,
            loggedin: false,
            loading: state.loading,
            loadingCount: state.loadingCount + 1
          });
        }
      });
  }
};

const purchaseArticle = () => {
  fetch(`http://localhost:8000/articles/purchase/${email}/${id}`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((resp) => {
      if (resp.status === 200) postPurchaseStatus('success');
    });
};

function PurchaseArticle() {
  const { email, id } = useParams();
  const [state, setState] = useState({
    guid: undefined, articleTitle: '', articlePrice: 0.00, loggedin: undefined, loading: true, loadingCount: 0,
  });
  const [authorizedPayment, setAuthorization] = useState(false);
  const loggedIn = useSelector(selectLoggedIn);

  const dispatch = useDispatch();
  dispatch(setIsIframe({ isIframe: true }))
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

  const PaymentButton = () => {
    const buttonStyle = {
      width:"50%",
      fontSize: "1.2rem",
      backgroundColor: "#00CCF9",
      borderColor: "#00CCF9",
      padding: "0.5rem",
      margin: "1rem"
    }
    if (!authorizedPayment) {
      return (
        <Button 
          style={buttonStyle} 
          type="submit" 
          onClick={() => setAuthorization(true)}
        >
          Buy Article
        </Button>
      );
    } else {
      return (
        <Button 
          style={buttonStyle} 
          type="submit" 
          onClick={purchaseArticle}
        >
          Confirm Purchase
        </Button>);
    }
  }
  console.log(state.loadingCount);
  // if (state.loadingCount < 2 && state.loading) {
  //   setState({
  //     guid: state.guid,
  //     articleTitle: state.articleTitle,
  //     articlePrice: state.articlePrice,
  //     loggedin: state.loggedin,
  //     loading: false,
  //     loadingCount: state.loadingCount,
  //   });
  // }
  // while(state.loading);
  console.log("loggedin", state.loggedin);
  if ( state.loggedin == undefined  || state.guid == undefined) {
    if (state.loggedin !== false) {
      return null;
    }
  }
  console.log(state.loggedin);
  if (state.loggedin || loggedIn) {
    return (
      <div style={{margin: "2rem"}} className="text-center">
        <h1 style={{fontSize:"2.5rem"}}>${state.articlePrice}</h1>
        <h2 style={{fontSize:"1.2rem"}}>
          To continue reading you have to purchase the article 
          <br></br><br></br>
          "{state.articleTitle}"
          <br></br>
          
        </h2>
        <PaymentButton />
        <p style={{marginTop:"1rem", position: "absolute", bottom: "0", textAlign:"center"}} className="text-center">Powered by PayPerRead</p>
      </div>
    );
  } else {
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
}

export default PurchaseArticle;
