import React, { useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import { withRouter } from 'react-router';
import App from './App';
import ReaderProfilePage from './ReaderProfilePage';
import PublisherProfilePage from './PublisherProfilePage';
import SignInPage from './SignInPage';
import VerifySignup from './VerifySignup';
import PurchaseArticle from './PurchaseArticle';
import Navbar from '../components/Navbar';
import AddBalance from './AddBalance';
import ContactUs from './ContactUs';

function AppRouter() {
  const welcomeRef = useRef(null);
  const aboutRef = useRef(null);

  return (
    <BrowserRouter>
      <Navbar welcomeRef={welcomeRef} aboutRef={aboutRef} />
      <Routes>
        <Route path="/" element={<App welcomeRef={welcomeRef} aboutRef={aboutRef} />} />
        <Route path="reader" element={<ReaderProfilePage />} />
        <Route path="publisher" element={<PublisherProfilePage />} />
        <Route path="signin/:user" element={<SignInPage />} />
        <Route path="verify-signup" element={<VerifySignup />} />
        <Route path="purchase/:id" element={<PurchaseArticle />} />
        <Route path="/reader/add-balance" element={<AddBalance />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
