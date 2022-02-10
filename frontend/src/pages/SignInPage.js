import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';    
import GoogleLogin from 'react-google-login';    

const SignInComponent = ({ subtitle, description, success, failure }) => (    
  <div className="center-content">    

    {/* set the width to be the size of 2 columns, and have a breakpoint at the predefined lg */}    
    <div className="col-lg-2">    

      {/* Use the fonts and colors defined in global.css */}    
      <h1 className="mb-0 primary-font primary-color fw-bold">PayPerRead</h1>    
      <h2 className="primary-font primary-color">{subtitle}</h2>    

      <p className="mt-3 secondary-font secondary-color">{description}</p>    

      {/* TODO: We may put an explanatory page linked here */}
      <p className="secondary-font secondary-color">Learn more about how we work <Link to="">here</Link>.</p>    


      {/* TODO: fix styling because the library's implementation of styling is a bitch */}
      <GoogleLogin    
        clientId="395326925781-gs6ubj69r0egkkeifimohrktr2h3an6p.apps.googleusercontent.com"    
        buttonText="Sign in"    
        icon={false}
        onSuccess={success}    
        onFailure={failure}    
        cookiePolicy={'single_host_origin'}    
        className="styled-button secondary-font primary-color justify-content-center"
        style={{ color: "#f00" }}
      />    
    </div>    
  </div>    
);    

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
const doesUserExist = (response, navigate, userType) => (exists, doesnt) => {
  const email = response.profileObj.email;
  fetch(`http://localhost:8000/${userType}/${email}`).then((resp) => {

    if(resp.status === 200)
      exists(response, navigate, userType);
    else
      doesnt(response, navigate, userType);

  });
}


/*
 * Tells our frontend to move to a page where the user can verify that they
 * want to create an account. No account creation happens in this component,
 * only in VerifySignup.js
 * 
 * response: the response returned from the google button component
 * navigate: the react router hook which navigates from a component
 * userType: 'publisher' or 'reader' based on the slug
 */
const create_new = (response, navigate, userType) => {
  navigate("/verify-signup", { 
    state: { 
      tokenId: response.tokenId, 
      name: response.profileObj.name, 
      email: response.profileObj.email, 
      userType: userType 
    } 
  });

}

/*
 * This function logs into our service with the credentials provided by google.
 * This function assumes that the user already exists in our system
 *
 * response: the response returned from the google button component
 * navigate: the react router hook which navigates from a component
 * userType: 'publisher' or 'reader' based on the slug
 */
const login = (response, navigate, userType) => {

  const url = `http://localhost:8000/login/${userType}`;

  fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: new Headers({
      'Authorization': `${response.tokenId}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    )
  }).then(resp => {
    if(resp.status === 200) {
      navigate("/");
    } else {
      console.log(resp.status);
    }
  });
}

const SignInPage = () => {    

  const navigate = useNavigate();
  const { user } = useParams(); // get the slug

  // check if the signup is valid
  if(user !== 'reader' && user !== 'publisher') 
    return (<div />); // redirect to a 404 page

  const isPublisher = (user === 'publisher');

  // On the Google signin success
  const success = (response) => {
    doesUserExist(response, navigate, user)(login, create_new);
  };    
  const failure = (response) => {
    console.log('Google failure, please try again.');
  };

  return (
    <SignInComponent 
      subtitle={isPublisher ? 'Publisher' : ''} 
      description={isPublisher ? 
          `Sign up here to add PayPerRead to your site and begin getting paid for your work.` :
          `We are a web3-inspired service that helps connect your contribution directly to the author.`
      }
      success={success}
      failure={failure}
    />
  );
};

export default SignInPage;

