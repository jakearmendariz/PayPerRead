import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import "./css/Navbar.css";
import { selectLoggedIn, setLoggedIn, selectIsIframe } from "../redux/slice";
import { remValue } from "../utils/methods";
import { buildApiUrl } from "../utils/ApiConfig";
import Dropdown from "react-bootstrap/Dropdown";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import DropdownButton from "react-bootstrap/DropdownButton";

/** Check if the user is loggedin */
const isLoggedIn = (dispatch) => {
  fetch(buildApiUrl("cookies"), {
    credentials: "include",
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
  document.cookie = "";
  fetch(buildApiUrl("logout"), {
    credentials: "include",
  }).then((resp) => {
    document.cookie = "isPublisher= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.reload(false);
  });
};

/** ManageProfile */
function ManageProfile(props) {
  const { onClick } = props;
  let isPublisher = false;
  // TODO: Cleanup
  const docCookies = document.cookie.split("; ");
  docCookies.forEach((docCookie) => {
    docCookie = docCookie.split("=");
    if (docCookie[0] == "isPublisher") {
      isPublisher = docCookie[1] == "true";
    }
  });

  const profileLink = isPublisher ? "/publisher" : "/reader";

  return (
    <Dropdown.Item to={profileLink} className="nav-links">
      Manage Profile
    </Dropdown.Item>
  );
}

ManageProfile.propTypes = {
  loggedIn: PropTypes.bool,
};


const ResourceDropDown = (props) => {
  const [open, setOpen] = React.useState(false);
  const { title } = props;
  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <div
      className="dropdown"
      style={{ backgroundColor: "#0d3c5a", borderRadius: "10px" }}
    >
      <button className="drop-down" onClick={handleOpen}>
        <span style={{display:"inline"}}>{title} <svg
    role="img"
    width="12"
    height="10"
    viewBox="0 0 18 10"
    fill="none"
    stroke-width="1.8"
    stroke="#555"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <title></title>
      <path d="M1 1L9 9L17 1" stroke="#999" stroke-width="1"></path>
    </g>
  </svg></span>
      </button>
      {open ? (
        <ul
          className="menu"
          style={{ padding: "10px", backgroundColor: "white" }}
        >
          <li className="menu-item">
            <a className="drop-down-options">Menu 1</a>
          </li>
          <li className="menu-item">
            <a className="drop-down-options">Menu 2</a>
          </li>
        </ul>
      ) : null}
    </div>
  );
};

const navbarHeight = 70 - remValue(2);

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

  return isIframe ? (
    <></>
  ) : (
    <nav className="navbar">
      <div className="navbar-container">
        <u1 className="navbar-logo">
          <li className="nav-item">
            <img src="logo-blue-center.png" alt="logo" />
          </li>
          <li className="nav-item">
            <ResourceDropDown title="Resources" />
          </li>
          <li className="nav-item">
            <NavLink to="/" className="nav-links">
              Developers
            </NavLink>
          </li>
        </u1>
        {/* <div className="menu-icon" onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div> */}
        <ul className={click ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item"></li>
          {isLoggedIn ? (
            <DropdownButton
              id="dropdown-basic-button"
              title="Profile"
              className="drop-down"
              variant="custom"
              style={{ backgroundColor: "#0d3c5a" }}
            >
              <ManageProfile onClick={() => setClick(false)} />
              <Dropdown.Item href="/" onClick={logout}>
                Logout
              </Dropdown.Item>
            </DropdownButton>
          ) : (
            <li className="nav-item" onClick={onClick}>
              <Link to="/signin/reader" className="nav-links">
                Sign Up
              </Link>
            </li>
          )}
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
