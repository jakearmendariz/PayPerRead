import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import GoogleLogin from 'react-google-login';

import LoadingIcon from '../components/LoadingIcon';

import { useDispatch } from 'react-redux';
import { setLoggedIn } from '../redux/slice';
import { buildApiUrl } from '../utils/ApiConfig';

function SignInComponent({
  subtitle, description, success, failure, alternate,
}) {
  const otherAccount = subtitle === 'Reader' ? 'Publisher' : 'Reader';
  return (
    <div className="signin-page">
      <div className="center-content">

        {/* set the width to be the size of 2 columns, and have a breakpoint at the predefined lg */}
        <div className="col-lg-3">

          {/* Use the fonts and colors defined in global.css */}
          <h1 className="mb-0 primary-font primary-color fw-bold">PayPerRead</h1>
          <h2 className="primary-font primary-color">{subtitle}</h2>

          <p className="mt-3 secondary-font secondary-color">{description}</p>

          {/* TODO: We may put an explanatory page linked here */}
          {/* <p className="secondary-font secondary-color">
            Learn more about how we work
            {' '}
            <a href="/">here</a>
          </p> */}

          <p className="my-3 secondary-font secondary-color">
            Not the right type of account?
            {' '}
            <Link to={alternate}>Click here</Link>
            {' '}
            to sign up as a
            {' '}
            {otherAccount}
            .
          </p>

          {/* TODO: fix styling because the library's implementation of styling is a bitch */}
          <GoogleLogin
            clientId="395326925781-gs6ubj69r0egkkeifimohrktr2h3an6p.apps.googleusercontent.com"
            buttonText="Sign in"
            icon={false}
            onSuccess={success}
            onFailure={failure}
            cookiePolicy="single_host_origin"
            className="styled-button secondary-font primary-color justify-content-center"
            style={{ color: '#f00' }}
          />

        </div>
      </div>
    </div>
  );
}

SignInComponent.defaultProps = {
  subtitle: '',
  description: '',
  success: () => {},
  failure: () => {},
  alternate: '',
};

SignInComponent.propTypes = {
  subtitle: PropTypes.string,
  description: PropTypes.string,
  success: PropTypes.func,
  failure: PropTypes.func,
  alternate: PropTypes.string,
};

/*
 * This function queries our backend to figure out whether the user already
 * exists in our system, and then calls the corresponding passed in function
 *
 * response: the response returned from the google button component
 * navigate: the react router hook which navigates from a component
 * userType: 'publisher' or 'reader' based on the slug
 *
 * exists: the function to be called if the user exists in our db
 * doesnt: if they don't
 */
const doesUserExist = (response, navigate, userType, dispatch) => (exists, doesnt) => {
  const { email } = response.profileObj;
  fetch(buildApiUrl(`${userType}/${email}`)).then((resp) => {
    if (resp.status === 200) exists(response, navigate, userType, dispatch);
    else doesnt(response, navigate, userType);
  });
};

/*
 * Tells our frontend to move to a page where the user can verify that they
 * want to create an account. No account creation happens in this component,
 * only in VerifySignup.js
 *
 * response: the response returned from the google button component
 * navigate: the react router hook which navigates from a component
 * userType: 'publisher' or 'reader' based on the slug
 */
const createNew = (response, navigate, userType) => {
  navigate('/verify-signup', {
    state: {
      tokenId: response.tokenId,
      name: response.profileObj.name,
      email: response.profileObj.email,
      userType,
    },
  });
};

/*
 * This function logs into our service with the credentials provided by google.
 * This function assumes that the user already exists in our system
 *
 * response: the response returned from the google button component
 * navigate: the react router hook which navigates from a component
 * userType: 'publisher' or 'reader' based on the slug
 */
const login = (response, navigate, userType, dispatch) => {
  const url = buildApiUrl(`login/${userType}`);

  fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: new Headers({
      Authorization: `${response.tokenId}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
  }).then((resp) => {
    if (resp.status === 200) {
      dispatch(setLoggedIn({ loggedIn: true }));
      navigate('/');
    } else {
      // console.log(resp.status);
    }
  });
};

function SignInPage() {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies();
  const { user } = useParams(); // get the slug
  const dispatch = useDispatch();
  const [ state, setState ] = useState({ loading: false });

  if(state.loading) return (<LoadingIcon />);


  // check if the signup is valid
  if (user !== 'reader' && user !== 'publisher') { return (<div />); } // redirect to a 404 page

  const isPublisher = (user === 'publisher');

  // On the Google signin success
  const success = (response) => {
    // Cookie to distinguish between reader and publisher account
    setState({ loading: true });
    setCookie('isPublisher', isPublisher, {
      path: '/',
      maxAge: 3600,
    });
    doesUserExist(response, navigate, user, dispatch)(login, createNew);
  };
  const failure = () => {};

  return (
    <SignInComponent
      subtitle={isPublisher ? 'Publisher' : 'Reader'}
      description={isPublisher
        ? 'Sign up here to add PayPerRead to your site and begin getting paid for your work.'
        : 'Sign up as a reader to begin contributing to authors and view the content you love.'}
      success={success}
      failure={failure}
      alternate={isPublisher ? '/signin/reader' : '/signin/publisher'}
    />
  );
}

export default SignInPage;
