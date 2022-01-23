import React from "react";

/* Uses Fetch API to grab content from MongoDB */
class FetchNames extends React.Component {
    state = {
        loading: true,
        names: null,
    }
    async componentDidMount() {   //This function will fetch data
        const url = "api"; //put link to database here
        const response = await fetch(url);
        const data = await response.json();
        this.setState({names: data.results, loading: false})
        console.log(data.results); //I like to keep this here to check what kind of data I'm dealing with
    }
    render() {
        if(this.state.loading ) {   //check for nulls
            return <br />;
        }

        if(!this.state.names){ //check for nulls
            return <br />;
        }

        /*Print data here */
        return <div style={{fontWeight: "bold"}}>
            <br />
             <div>
                 <p>Welcome</p>
            </div> 
        </div>
    }
}

export default FetchNames