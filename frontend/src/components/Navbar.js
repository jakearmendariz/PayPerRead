import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';

/** Check if the user is loggedin */
const isLoggedIn = (setLogin) => {
  fetch('http://localhost:8000/cookies', {
    credentials: 'include',
  }).then((resp) => {
    if (resp.status === 200) {
      setLogin(true);
    } else {
      setLogin(false);
    }
  });
};

/** Logouts the user */
const logout = () => {
  fetch('http://localhost:8000/logout', {
    credentials: 'include',
  }).then((resp) => { window.location.reload(false); });
};

/**
 * Different components should show up for a loggedin user.
 * @returns Returns a list item for signing in or logging out
 */
function SigninOrLogout(props) {
  const { loggedin } = props;
  if (loggedin) {
    return (
      <li onClick={logout} className="nav-item">
        <Link to="/" className="nav-links">
          Logout
        </Link>
      </li>
    );
  }
  return (
    <li className="nav-item">
      <Link to="/signin/reader" className="nav-links">
        Sign Up
      </Link>
    </li>
  );
}

/** ManageProfile */
function ManageProfile(props) {
  const { loggedin } = props;
  if (loggedin) {
    return (
      <li className="nav-item">
        <Link to="/" className="nav-links">
          Manage Profile
        </Link>
      </li>
    );
  }
  return null;
}

function Navbar(props) {
  const [click, setClick] = useState(false);
  const [loggedin, setLogin] = useState(false);

  const handleClick = () => setClick(!click);
  const scrollToView = (componentRef) => window.scrollTo(0, componentRef.current.offsetTop);

  const { welcomeRef, aboutRef } = props;

  isLoggedIn(setLogin);
  return (
    <li className="nav-item">
      <Link to="/signin/reader" className="nav-links">
        Sign Up
      </Link>
    </li>
  );
}

/** ManageProfile */
function ManageProfile(props) {
  const { loggedin } = props;
  if (loggedin) {
    return (
      <li className="nav-item">
        <Link to="/" className="nav-links">
          Manage Profile
        </Link>
      </li>
    );
  }
  return null;
}

function Navbar() {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const [loggedin, setLogin] = useState(false);
  isLoggedIn(setLogin);
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 to="/" className="navbar-logo">
          PayPerRead
          <i className="fab fa-pushed" />
        </h1>
        <div className="menu-icon" onClick={handleClick}>
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item" onClick={() => scrollToView(welcomeRef)}>
            <NavLink to="/" className="nav-links">
              Home
            </NavLink>
          </li>
          <li className="nav-item" onClick={() => scrollToView(aboutRef)}>
            <NavLink to="/" className="nav-links">
              About Us
<<<<<<< HEAD
            </NavLink>
=======
            </Link>
>>>>>>> b616f588 (Added logout endpoint and a changing nav bar if user is loggedin)
          </li>
          <ManageProfile loggedin={loggedin} />
          <SigninOrLogout loggedin={loggedin} />
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
