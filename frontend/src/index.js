import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { CookiesProvider } from 'react-cookie';
import reportWebVitals from './reportWebVitals';

import AppRouter from './pages/AppRouter';

import './global.css';

ReactDOM.render(
  <React.StrictMode>
    <CookiesProvider>
      <AppRouter />
    </CookiesProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
