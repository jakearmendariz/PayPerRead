import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import './css/Navbar.css';
import { selectLoggedIn, setLoggedIn, selectIsIframe } from '../redux/slice';
import { remValue } from '../utils/methods';

/** Check if the user is loggedin */
const isLoggedIn = (dispatch) => {
  fetch('http://localhost:8000/cookies', {
    credentials: 'include',
  }).then((resp) => {
    if (resp.status === 200) {
      dispatch(setLoggedIn({ loggedIn: true }));
    } else {
      dispatch(setLoggedIn({ loggedIn: false }));
    }
  });
};

/** Logouts the user */
const logout = () => {
  document.cookie = '';
  fetch('http://localhost:8000/logout', {
    credentials: 'include',
  }).then((resp) => {
    document.cookie = 'isPublisher= ; expires = Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.reload(false);
  });
};

/**
 * Different components should show up for a loggedin user.
 * @returns Returns a list item for signing in or logging out
 */
function SigninOrLogout(props) {
  const { loggedIn, onClick } = props;
  if (loggedIn) {
    return (
      <li onClick={logout} className="nav-item">
        <Link to="/" className="nav-links">
          Logout
        </Link>
      </li>
    );
  }
  return (
    <li className="nav-item" onClick={onClick}>
      <Link to="/signin/reader" className="nav-links">
        Sign Up
      </Link>
    </li>
  );
}

SigninOrLogout.propTypes = {
  loggedIn: PropTypes.bool,
};

/** ManageProfile */
function ManageProfile(props) {
  const { loggedIn, onClick } = props;
  let isPublisher = false;
  // TODO: Cleanup
  const docCookies = document.cookie.split('; ');
  docCookies.forEach((docCookie) => {
    docCookie = docCookie.split('=');
    if (docCookie[0] == 'isPublisher') {
      isPublisher = docCookie[1] == 'true';
    }
  });

  const profileLink = isPublisher ? '/publisher' : '/reader';

  if (loggedIn) {
    return (
      <li className="nav-item" onClick={onClick}>
        <Link to={profileLink} className="nav-links">
          Manage Profile
        </Link>
      </li>
    );
  }
  return null;
}

ManageProfile.propTypes = {
  loggedIn: PropTypes.bool,
};

const navbarHeight = (70 - remValue(2));

function Navbar(props) {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const dispatch = useDispatch();
  const loggedIn = useSelector(selectLoggedIn);
  const isIframe = useSelector(selectIsIframe);

  const scrollToView = (componentRef) => {
    if (componentRef && componentRef.current) {
      window.scrollTo(0, componentRef.current.offsetTop - navbarHeight);
    }
  };


  const { welcomeRef, aboutRef } = props;

  isLoggedIn(dispatch);

  return isIframe
    ? (
      <nav className="navbar">
        <div className="navbar-container">
          <h1 to="/" className="navbar-logo">
            PayPerRead
            <i className="fab fa-pushed" />
          </h1>
        </div>
      </nav>
    )
    : (
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
            <li className="nav-item" onClick={() => {
              scrollToView(welcomeRef);
              handleClick();
            }}>
              <NavLink to="/" className="nav-links">
                Home
              </NavLink>
            </li>
            <li className="nav-item" onClick={() => {
              scrollToView(aboutRef);
              handleClick();
            }}>
              <NavLink to="/" className="nav-links">
                About Us
              </NavLink>
            </li>
            <ManageProfile loggedIn={loggedIn} onClick={handleClick} />
            <SigninOrLogout loggedIn={loggedIn} onClick={handleClick} />
          </ul>
        </div>
      </nav>
    );
}

Navbar.propTypes = {
  welcomeRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  aboutRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
};

export default Navbar;
