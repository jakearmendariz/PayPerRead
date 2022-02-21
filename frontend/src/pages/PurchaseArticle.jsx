import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// <iframe src="http://localhost:3000/purchase/uiafjdkahfueh" />

function PurchaseArticle() {

  const navigate = useNavigate();
  const id  = '123E5C'//useParams();
  const [ state, setState ] = useState({ articleTitle: "", articlePrice: 0.00 });

  // check if the user owns the article,
  // if not logged in direct them to signin
  useEffect(() => {
    fetch(`http://localhost:8000/articles/own/${id}`, {
      credentials: 'include',
    })
      .then((resp) => {
        if(resp.status == "200")
          postPurchaseStatus("success");
        console.log(resp);
      })
      .catch((err) => {
        // Reader need to sign in first
        navigate('/signin/reader');
      });

  });

  const purchaseArticle = () => {

    const payload = {
      publisher_email: "xyan87@ucsc.edu",
      article_guid: '123E5C',
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
        if(resp.status == 200) {
          console.log(resp);
          postPurchaseStatus("success");
        }
      })
      .catch((err) => {
        // Reader need to sign in first
        navigate('/signin/reader');
      });
  }

  // send message to parent about article purchase status
  const postPurchaseStatus = (s) => {
    postMessage(s, window.parent);
  };

  
  return (
    <div>
      <h1>{state.articleTitle}</h1>
      <h2>{state.articlePrice}</h2>
      <button onClick={purchaseArticle}>Purchase</button>
    </div>
  );
}

export default PurchaseArticle;

