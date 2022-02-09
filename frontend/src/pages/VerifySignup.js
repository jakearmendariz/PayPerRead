import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const create_new_user = (details, navigate) => () => {

	const payload = {
		email: details.state.email,
		name: details.state.name
	};
	const isPublisher = details.state.userType == 'publisher';
	if (isPublisher) {
		payload.domain = "abc.com";
	}
	const p = JSON.stringify(payload);
	console.log(p);

	// TODO: publisher endpoint yet to be implemeneted
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
		body: JSON.stringify(payload)
	}).then(resp => {
		console.log(resp);
		if(resp.status === 201)
			navigate("/");
	});

};

const VerifySignup = () => {

	const navigate = useNavigate();
	const location = useLocation();
	console.log(location)

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
