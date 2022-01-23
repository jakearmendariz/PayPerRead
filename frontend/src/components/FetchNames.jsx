import React, { useState, useEffect } from "react";

const defaultState = {
	names: [],
};


/* Uses Fetch API to grab content from MongoDB */
const FetchNames = () => {

	const [ state, setState ] = useState(defaultState);
	
	// fetch the data and add it to the state when ready
	useEffect(() => {
		
		// the endpoint we are fetching from/the database (use a temporary one for now)
		const url = "";
		fetch(url)
			.then(data => data.json())
			.then(resp => {
				console.log(resp);
				setState({ names: resp });
			});

	}, [ setState ]);

	return (
		<div>
			<p>Welcome</p>
		</div>
	);

};

export default FetchNames;
