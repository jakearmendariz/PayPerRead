import './App.css';

import React, { useRef } from 'react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Welcome from '../components/Welcome';
import About from '../components/About';

function App() {
  const welcomeRef = useRef(null);
  const aboutRef = useRef(null);

  return (
    <div>
      <Navbar welcomeRef={welcomeRef} aboutRef={aboutRef} />
      <Welcome innerRef={welcomeRef} />
      <About innerRef={aboutRef} />
      <Footer />
    </div>
  );
}

export default App;
