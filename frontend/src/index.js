import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';

import App from './pages/App';
import ReaderProfilePage from './pages/ReaderProfilePage';
import PublisherLandingPage from './pages/PublisherLandingPage';
import SignInPage from './pages/SignInPage';
import VerifySignup from './pages/VerifySignup.js';
import PurchaseArticle from './pages/PurchaseArticle';

import { createGlobalStyle } from 'styled-components'

import './global.css';


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="reader" element={<ReaderProfilePage />} />
        <Route path="publisher" element={<PublisherLandingPage />} />
        <Route path="signin/:user" element={<SignInPage />} />
        <Route path="verify-signup" element={<VerifySignup />} />
        <Route path="purchase/:id" element={<PurchaseArticle />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
