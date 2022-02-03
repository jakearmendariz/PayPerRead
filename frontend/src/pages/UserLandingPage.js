import React from 'react';


function UserLandingPage() {
    fetch('http://localhost:8000/cookies', {
      credentials: 'include',
    }).then(resp => console.log(resp.text()));
    return (
      <div style={{padding: "30px"}}>
        FOR USERS
      </div>
    );
}

export default UserLandingPage;