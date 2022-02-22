import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// <iframe src="http://localhost:3000/purchase/uiafjdkahfueh" />

// send message to parent about article purchase status
const postPurchaseStatus = (s) => {
  window.parent.postMessage({ message: s }, "http://localhost:3001");
};

function PurchaseArticle() {

  const navigate = useNavigate();
  const { id } = useParams();
  const publisher_email = "xyan87@ucsc.edu"
  const [ state, setState ] = useState({ approved: false, articleTitle: "", articlePrice: 0.00 });

  // check if the user owns the article,
  // if not logged in direct them to signin
  useEffect(() => {
    fetch(`http://localhost:8000/articles/own/${publisher_email}.${id}`, {
      credentials: 'include',
    })
      .then((resp) => {
        if(resp.status == "200")
          postPurchaseStatus("success");
      })
      .catch((err) => {
        // Reader need to sign in first
        navigate('/signin/reader');
      });

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
        if(resp.status == 200)
          postPurchaseStatus("success");
      })
      .catch((err) => {
        // Reader need to sign in first
        navigate('/signin/reader');
      });
  }
  
  return (
    <div className="text-center">
      <h1>{state.articleTitle}</h1>
      <h2>${state.articlePrice}</h2>
      <button onClick={purchaseArticle}>Purchase</button>
    </div>
  );
}

export default PurchaseArticle;

