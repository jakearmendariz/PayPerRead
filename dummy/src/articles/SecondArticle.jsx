import React, { useState, useEffect } from 'react';

import logo from '../logo.svg'; 

const ArticleContents = () => (
    <div>
      <p>You just bought access to some premium content. This is just an example showing that our service doesn't put limits on your content. Our github is linked <a href="https://github.com/jakearmendariz/PayPerRead">here</a>.</p>
      
      <div>
        <span style={{ verticalAlign: "middle" }}>Also, shoutout react.</span>
        <img style={{ verticalAlign: "middle" }} width="64" src={logo} />
      </div>
    </div>
  );

// const Modal = () => (
//   <div id="ConfirmationModal" className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
//     <div className="modal-dialog" role="document">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
//           <button type="button" className="close" data-dismiss="modal" aria-label="Close">
//             <span aria-hidden="true">&times;</span>
//           </button>
//         </div>
//         <div className="modal-body">
//           ...
//         </div>
//         <div className="modal-footer">
//           <button type="button" className="btn btn-primary" data-dismiss="modal">Close</button>
//         </div>
//       </div>
//     </div>
//   </div>
// );

function SecondArticle() {

  const [ state, setState ] = useState({ approved: false });
  
  const listenForRequest = (e) => {

    if(e.origin != "http://localhost:3000")
      return;
    if(!e.data.message || !e.data.message.includes("success")) {
      console.log("error")
      return;
    }
    if(e.data.message.includes("purchase")) {
      window.confirm('Successfully purchased article')
      // $("#ConfirmationModal").modal();
    }
    setState({ approved: true });
  };

  useEffect(() => {
    window.addEventListener("message", listenForRequest);
    return () => window.removeEventListener("message", listenForRequest);
  }, []);


  const textCenterStyle = {
    textAlign: "center",
  };

  const iframeStyle = {
    border: "2px solid #ddd"
  };
  
  return (
    <div>
      <Modal />
      <div style={textCenterStyle}>
      <h2>Premium PayPerRead Content</h2>
      { 
        !state.approved &&
          <iframe style={iframeStyle} width="500" height="400" src="http://localhost:3000/purchase/dwilby@ucsc.edu/randomstring1" />
      }
      </div>
      { state.approved && <ArticleContents />}
    </div>
  );
}

export default SecondArticle;
