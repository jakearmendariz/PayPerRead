import React, { useEffect } from 'react';

/**
 * PayPerRead component contains the iframe logic for communicating with PayPerRead.com
 */
export const PayPerRead = (props) => {
    const { articleId, showArticle, setShowArticle, show } = props;
    const iframeUrl = `http://localhost:3000/purchase/${articleId}`
    const listenForRequest = (e) => {
        if (e.origin != "http://localhost:3000")
            return;
        if (!e.data.message || !e.data.message.includes("success")) {
            console.log("error from iframe")
            return;
        }
        // let message = JSON.parse(e.data.message);
        setShowArticle(true);
    };

    useEffect(() => {
        window.addEventListener("message", listenForRequest);
        return () => window.removeEventListener("message", listenForRequest);
    }, []);

    const iframeStyle = {
        border: "2px solid #ddd",
        display: show ? "inherit" : "none"
    };

    return (
        <div>
            {
                !showArticle &&
                <iframe style={iframeStyle} width="500" height="400" src={iframeUrl} />
            }
        </div>
    );
}