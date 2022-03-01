import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Button } from 'react-bootstrap';
import { setIsIframe, setLoggedIn } from '../redux/slice';

import { formatBalance } from '../utils/methods';

import styled from 'styled-components';

const CheckoutBox = styled.div`
  display: flex;
  width: 100%;
  justify-content: center
`

const LeftTh = styled.th`
  font-size: 1.2rem;
  font-weight: bold;
  text-align: left;
  padding-left: 1rem;
`
const RightTh = styled.th`
  font-size: 1.2rem;
  font-weight: bold;
  text-align: right;
`

const Divider = styled.hr`
  border-top: 2px solid #6f6f6f;
  color: #fff;
  margin-top: 0.5rem;
`;

const ErrorText = styled.div`
  color: red;
  font-size: 1rem;
  font-weight: normal
`

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

const fetchArticle = (state, setState, email, articleId) => {
  fetch(`http://localhost:8000/articles/${articleId}?email=${email}`)
    .then((resp) => {
      if (resp.status === 200) {
        resp.json().then((article) => {
          if (JSON.stringify(article.price) !== JSON.stringify(state.price)) {
            setState({
              guid: article.guid,
              articleTitle: article.article_name,
              articlePrice: article.price,
              loggedin: state.loggedin,
            });
          }
        });
      }
    });
};

const isLoggedin = (state, setState) => {
  if (state.loggedin === undefined) {
    fetch('http://localhost:8000/reader/account', {
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status === 200) {
          return resp.json();
        } else {
          setState({
            ...state,
            loggedin: false,
          });
          return null
        }
      })
      .then(data => {
        if (data !== null) {
          setState({
            ...state,
            balance: data.balance,
            loggedin: true,
          });
        }
      });
  }
};

function PaymentButton(props) {
  const { purchaseArticle, insufficientBalance } = props;
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

  const buttonText = confirmingPayment ? 'Confirm Purchase' : 'Buy Article';
  const handleClick = () => {
    if (confirmingPayment) {
      purchaseArticle();
    } else {
      setConfirmation(true);
    }
  }

  return (
    <>
      <Button
        style={buttonStyle}
        type="submit"
        onClick={handleClick}
      >
        {buttonText}
      </Button>
      {
        insufficientBalance &&
        <ErrorText>
          Insufficient Balance
        </ErrorText>
      }

    </>
  );
}

function PurchaseArticle() {
  // Define parameters and state
  const { email, id } = useParams();
  const [articleState, setArticleState] = useState({
    guid: undefined,
    articleTitle: undefined,
    articlePrice: {
      dollars: 0,
      cents: 0
    },
  });
  const [readerState, setReaderState] = useState({
    balance: {
      dollars: 0,
      cents: 0
    },
    loggedin: undefined
  });
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  // Actions
  const purchaseArticle = () => {
    fetch(`http://localhost:8000/articles/purchase/${email}/${id}`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status === 200) {
          postPurchaseStatus('success');
        } else {
          setInsufficientBalance(true);
        }
      });
  };

  // Work before rendering
  const dispatch = useDispatch();
  dispatch(setIsIframe({ isIframe: true }));
  // check if the user owns the article,
  // if not logged in direct them to signin
  useEffect(() => {
    if (readerState.loggedin) {
      dispatch(setLoggedIn({ loggedIn: true }));
      fetchArticle(articleState, setArticleState, email, id);
      ownsArticle(articleState);
    } else {
      isLoggedin(readerState, setReaderState);
    }
  }, [readerState.loggedin, articleState.guid]);

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
  if (readerState.loggedin === undefined || articleState.guid === undefined) {
    if (readerState.loggedin !== false) {
      return null;
    }
  }
  if (readerState.loggedin) {
    return (
      <div style={{ margin: '2rem' }} className="text-center">
        <p style={{ fontSize: '1.25rem' }}>
          To continue reading you have to purchase the article
          <br />
          &quot;
          {articleState.articleTitle}
          &quot;
          <br />
        </p>
        <Divider />
        <CheckoutBox>
          <table>
            <tbody>
              <tr>
                <RightTh>Your Balance:</RightTh>
                <LeftTh align="left">{formatBalance(readerState.balance)}</LeftTh>
              </tr>
              <tr>
                <RightTh align="right">Article Price:</RightTh>
                <LeftTh align="left">{formatBalance(articleState.articlePrice)}</LeftTh>
              </tr>
            </tbody>
          </table>
        </CheckoutBox>
        <PaymentButton
          purchaseArticle={purchaseArticle}
          insufficientBalance={insufficientBalance}
        />
        <p
          style={{
            marginTop: '1rem', position: 'absolute', bottom: '0', textAlign: 'center',
          }}
          className="text-center"
        >
          Powered by PayPerRead
        </p>
      </div >
    );
  }
  return (
    <div style={{ margin: '2rem' }} className="text-center">
      <h2 style={{ fontSize: '2rem' }}>Hi!</h2>
      <p style={{ fontSize: '1.25rem' }}>This page is requesting a one time fee to read this article.</p>
      <p style={{ fontSize: '1.25rem', marginTop: "1rem" }}>
        To continue you reading, you must make a <a style={{ color: "black" }} href="http://localhost:3000">PayPerRead</a> account.
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
