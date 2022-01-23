import FetchNames from "./FetchNames"


const Welcome = ({ title }) => {
    return (
        <div className = "announcement-container">
            <p className = "announcement-logo announcement-font" style = {{margin: "auto", padding: "5px"}}> List of names:</p>
            <section className= "announcement-box" style={{backgroundColor: "white", color: "black",  margin: "auto", maxWidth: "1000px", padding: "15px"  }}>
            <FetchNames />  
            </section>
        </div>
    )
}

export default Welcome