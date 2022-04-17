import React, { useEffect, useState } from 'react';
import { NavLink, useParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { buildApiUrl } from "../utils/ApiConfig"
import { setIsIframe, setLoggedIn, setPaymentRedirect } from '../redux/slice';
import { Button } from 'react-bootstrap';
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
const buttonStyle = {
  width: '50%',
  fontSize: '1.2rem',
  backgroundColor: '#00CCF9',
  borderColor: '#00CCF9',
  outline: 'none',
  outlineOffset: 'none',
  padding: '0.5rem',
  margin: '1.5rem',
  boxShadow: 'none',
};

// send message to parent about article purchase status
const postPurchaseStatus = (s) => {
  window.parent.postMessage({ message: s }, document.referrer);
};

const ownsArticle = (state, setConfirmationPage) => {
  if (state.guid) {
    fetch(buildApiUrl(`articles/own/${state.guid}`), {
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status === 200) {
          postPurchaseStatus('success-owns');
          setConfirmationPage(true);
        }
      });
  }
};

const fetchArticle = (state, setState, articleId) => {
  fetch(buildApiUrl(`articles/${articleId}`))
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
    fetch(buildApiUrl('reader/account'), {
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
        <>
          <ErrorText>
            Insufficient Balance
          </ErrorText>
          <ErrorText>
            Please add more money to your balance
            {' '}
            <NavLink to="/reader/add-balance">here</NavLink>
          </ErrorText>
        </>
      }

    </>
  );
}

function PurchaseArticle() {
  // Define parameters and state
  const { id } = useParams();
  const [confirmationPage, setConfirmationPage] = useState(false);
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
  const location = useLocation();

  // Actions
  const purchaseArticle = () => {
    fetch(buildApiUrl(`articles/purchase/${id}`), {
      method: 'POST',
      credentials: 'include',
    })
      .then((resp) => {
        if (resp.status === 200) {
          // postPurchaseStatus('success-purchase');
          setConfirmationPage(true);
        } else {
          setInsufficientBalance(true);
        }
      });
  };

  // Work before rendering
  const dispatch = useDispatch();
  dispatch(setIsIframe({ isIframe: true }));
  dispatch(setPaymentRedirect({ paymentRedirect: location.pathname }));
  // check if the user owns the article,
  // if not logged in direct them to signin
  useEffect(() => {
    if (readerState.loggedin) {
      dispatch(setLoggedIn({ loggedIn: true }));
      fetchArticle(articleState, setArticleState, id);
      ownsArticle(articleState, setConfirmationPage);
    } else {
      isLoggedin(readerState, setReaderState);
    }
  }, [readerState.loggedin, articleState.guid]);

  // Render
  if (readerState.loggedin === undefined || articleState.guid === undefined) {
    if (readerState.loggedin !== false) {
      return null;
    }
  }
  if (confirmationPage) {
    return (
      <div style={{ margin: '2rem', marginTop: '3rem' }} className="text-center">
        <h2 style={{ fontSize: '2rem' }}>Confirmed</h2>
        <p style={{ fontSize: '1.25rem' }}>You have succesfully purchased this article.</p>
        <p style={{ fontSize: '1.25rem', marginTop: "1rem" }}>
          <Button onClick={() => postPurchaseStatus('success')} className="btn btn-primary" style={buttonStyle} variant="primary">Start Reading</Button>
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
    )
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
        <br></br>
        Refresh this page after you are logged in.
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
