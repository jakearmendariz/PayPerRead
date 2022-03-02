import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLoggedIn } from '../redux/slice';
import { buildApiUrl } from '../utils/ApiConfig';

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
  const [state, setState] = useState({ text: '' });
  const dispatch = useDispatch();
  const isPublisher = location.state.userType === 'publisher';
  const handleChange = (e) => {
    setState({ text: e.currentTarget.value });
  };

  return (
    <div className="center-content">
      <div className="col-lg-2">
        <h1 className="primary-font primary-color">Verify</h1>
        <p className="secondary-font primary-color">
          Hi
          {location.state.name}
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
        <button
          type="submit"
          className="styled-button primary-color secondary-font"
          onClick={createNewUser(location, navigate, { domain: state.text }, dispatch)}
        >
          Verify Signup
        </button>
      </div>
    </div>
  );
}

export default VerifySignup;
