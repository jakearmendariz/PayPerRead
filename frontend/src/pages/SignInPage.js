import React from 'react';
import { useParams } from 'react-router-dom';

const SignInComponent = ({ subtitle, description }) => (
	<div className="container">

		<h1>PayPerRead</h1>
		<h2>{subtitle}</h2>

		<p>{description}</p>

		<p>Learn more about how we work <a>here</a>.</p>

		<button>Sign in</button>

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
