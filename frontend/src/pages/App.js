import './App.css';

import React, { useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Welcome from '../components/Welcome';
import About from '../components/About';

function App({ welcomeRef, aboutRef }) {
  return (
    <div>
      <Welcome innerRef={welcomeRef} />
      <About innerRef={aboutRef} />
      <Footer />
    </div>
  );
}

export default App;
