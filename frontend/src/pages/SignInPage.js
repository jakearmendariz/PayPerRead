import React from 'react';
import { useParams } from 'react-router-dom';

const SignInComponent = ({ subtitle, description }) => (
	<div className="center-content">

		{/* set the width to be the size of 2 columns, and have a breakpoint at the predefined lg */}
		<div className="col-lg-2">

			{/* Use the fonts and colors defined in global.css */}
			<h1 className="mb-0 primary-font primary-color fw-bold">PayPerRead</h1>
			<h2 className="primary-font primary-color">{subtitle}</h2>

			<p className="mt-3 secondary-font secondary-color">{description}</p>

			<p className="secondary-font secondary-color">Learn more about how we work <a>here</a>.</p>

			<button className="styled-button secondary-font primary-color">Sign in</button>
		</div>
	</div>
);

const SignInPage = () => {

	const { user } = useParams(); // get the slug
	
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
		/>
	);
};

export default SignInPage;
