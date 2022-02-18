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
      <div onClick={logout} className="col-1">
        <Link to="/" className="">
          Logout
        </Link>
      </div>
    );
  }
  return (
    <div className="col-1">
      <Link to="/signin/reader" className="">
        Sign Up
      </Link>
    </div>
  );
}

/** ManageProfile */
function ManageProfile(props) {
  const { loggedin } = props;
  if (loggedin) {
    return (
      <div className="col-1">
      </div>
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
    <nav className="navbar fixed-top container-fluid">
      <div className="row w-100">

        <h1 to="/" className={[`col-${loggedin ? 8 : 9}`, "text-white"].join(" ")}>
          PayPerRead
          <i className="" />
        </h1>
        
        {/* <div className="display-none" onClick={handleClick}> 
          <i className={click ? '' : ''} />
        </div>*/}
        
          <div className="col-1" onClick={() => scrollToView(welcomeRef)}>
            <NavLink to="/" className="">
              Home
            </NavLink>
          </div>

          <div className="col-1" onClick={() => scrollToView(aboutRef)}>
            <NavLink to="/" className="">
              About Us
            </NavLink>
          </div>

          { loggedin && 
            <div className="col-1">
              <Link to="/" className="">Manage Profile</Link>
            </div>
          }

          <div onClick={loggedin && logout} className="col-1">
            <Link to={loggedin ? "/" : "/signin/reader"} className="">
              { loggedin ? "Logout" : "Sign up" }
            </Link>
          </div>
      
      </div>
    </nav>
  );
}

export default Navbar;
