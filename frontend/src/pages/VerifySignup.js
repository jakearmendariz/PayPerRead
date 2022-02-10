import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/*
 * Create the user and then redirect to the homepage
 */
const create_new_user = (details, navigate) => () => {

  const isPublisher = details.state.userType === 'publisher';

  const payload = {
    email: details.state.email,
    name: details.state.name
  };
  if (isPublisher)
    payload.domain = "abc.com";

  const p = JSON.stringify(payload);

  const url = isPublisher ? 'http://localhost:8000/publisher/new-publisher' : 'http://localhost:8000/reader/new-reader';

  // A post with no-cors has less options for content-type
  fetch(url, {
    method: 'POST',
    // credentials:'same-origin',
    credentials: 'include',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    headers: {
      'Authorization': details.state.tokenId,
      'Content-type': 'application/json',

    },
    body: p
  }).then(resp => {
    if(resp.status === 201)
      navigate("/");
  });

};

const VerifySignup = () => {

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="center-content">
      <div className="col-lg-2">
        <h1>Verify</h1>
        <p>Hi {location.state.name},</p>
        <p>Click verify to create your account with the following email,</p>
        <p>{location.state.email}</p>
        <button className="styled-button" onClick={create_new_user(location, navigate)}>Verify Signup</button>
      </div>
    </div>
  );
}


export default VerifySignup;
