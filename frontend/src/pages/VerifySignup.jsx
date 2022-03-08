import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoggedIn } from '../redux/slice';
import { buildApiUrl } from '../utils/ApiConfig';
import { Button } from 'react-bootstrap';
import LoadingIcon from '../components/LoadingIcon';

/*
 * Create the user and then redirect to the homepage
 */
const createNewUser = (details, navigate, publisherDetails, dispatch) => () => {
  const isPublisher = details.state.userType === 'publisher';

  const payload = {
    email: details.state.email,
    name: details.state.name,
  };

  // some basic checking on their inputed details
  if (isPublisher && publisherDetails.domain === '') return;

  if (isPublisher) payload.domain = publisherDetails.domain;

  const p = JSON.stringify(payload);

  const url = buildApiUrl(isPublisher ? 'publisher/new-publisher' : 'reader/new-reader');

  // A post with no-cors has less options for content-type
  fetch(url, {
    method: 'POST',
    // credentials:'same-origin',
    credentials: 'include',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    headers: {
      Authorization: details.state.tokenId,
      'Content-type': 'application/json',

    },
    body: p,
  }).then((resp) => {
    if (resp.status === 201) {
      navigate('/');
      dispatch(setLoggedIn({ loggedIn: true }));
    }
  });
};

function VerifySignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState({ text: '', loading: false });
  const dispatch = useDispatch();
  const isPublisher = location.state.userType === 'publisher';
  const handleChange = (e) => {
    setState({ text: e.currentTarget.value });
  };

  if(state.loading)
    return (<LoadingIcon style={{marginTop: "10rem"}}/>);

  return (
    <div className="center-content">
      <div className="col-lg-3">
        <h1 className="mb-0 primary-font primary-color fw-bold">PayPerRead</h1>
        <h2 className="primary-font primary-color">Create Account</h2>
        <p className="secondary-font primary-color">
          Hi
          {' ' + location.state.name}
          ,
        </p>
        <p className="secondary-font primary-color my-1">Click verify to create your account with the following email,</p>
        <p className="secondary-font primary-color">{location.state.email}</p>
        {isPublisher
          && (
            <div className="mt-1 mb-3 secondary-font primary-color">
              <p className="mb-1">Please specify your targeted domain:</p>
              <input className="w-100" onChange={handleChange} />
            </div>
          )}
        <Button
          type="submit"
          className="styled-button secondary-font primary-color justify-content-center"
          style={{ color: '#f00', padding: '2rem' }}
          onClick={() => {
            setState({ ...state, loading: true });
            createNewUser(location, navigate, { domain: state.text }, dispatch)();
          }}
        >
          Verify Signup
        </Button>
      </div>
    </div>
  );
}

export default VerifySignup;
