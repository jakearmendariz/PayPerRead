import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'

function Navbar() {
    const [click, setClick] = useState(false);

    const handleClick = () => setClick(!click);

  return (
      <>
      <nav className="navbar">
          <div className="navbar-container">
              <h1 to="/" className="navbar-logo">
                  PayPerRead
                  <i className="fab fa-pushed"></i>
              </h1>
              <div className="menu-icon" onClick={handleClick}>
                  <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
              </div>
              <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                  <li className='nav-item'>
                      <Link to='/' className='nav-links'>
                          Home
                      </Link>
                  </li>
                  <li className='nav-item'>
                      <Link to='/' className='nav-links'>
                          About Us
                      </Link>
                  </li>
                  <li className='nav-item'>
                      <Link to='/' className='nav-links'>
                          Sign Up
                      </Link>
                  </li>
              </ul>
          </div>
      </nav>
      </>
  )
}

export default Navbar;

