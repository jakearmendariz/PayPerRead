import React, { useState } from 'react';    
import { useParams, useNavigate } from 'react-router-dom';    
import GoogleLogin from 'react-google-login';    
    
    
const SignInComponent = ({ subtitle, description, success, failure }) => (    
        <div className="center-content">    
    
                {/* set the width to be the size of 2 columns, and have a breakpoint at the predefined lg */}    
                <div className="col-lg-2">    
    
                        {/* Use the fonts and colors defined in global.css */}    
                        <h1 className="mb-0 primary-font primary-color fw-bold">PayPerRead</h1>    
                        <h2 className="primary-font primary-color">{subtitle}</h2>    
    
                        <p className="mt-3 secondary-font secondary-color">{description}</p>    
    
                        <p className="secondary-font secondary-color">Learn more about how we work <a>here</a>.</p>    
    
    
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
    
const SignInPage = () => {    
    
        const { user } = useParams(); // get the slug    
        const navigate = useNavigate();    
    
        const success = (response) => {    
                const url = `http://localhost:8000/login/${response.profileObj.email}`;    
		fetch(url).then(resp => {
			if(resp.status === 200)
				navigate("/");
		})
        };    
    
        const failure = (response) => {
		
	};

        // check if the signup is valid
        if(user !== 'reader' && user !== 'publisher') 
                return (<div />); // redirect to a 404 page

        const isPublisher = (user === 'publisher');

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

