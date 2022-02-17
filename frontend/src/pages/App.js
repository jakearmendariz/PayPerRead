import './App.css';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Welcome from '../components/Welcome';
import About from '../components/About';

function App() {
  return (
    <div>
      {/* <h1 className="mb-0 primary-font primary-color fw-bold">PayPerRead</h1>  */}
      <Navbar />
      <Welcome />
      <About />
      {/* <div className="center-content">

      <div className="col-lg-2">

        <h1 style={{paddingRight:"20px"}}>Are you a ...</h1>

          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between",  }}>
            <Link to="signin/reader" style={{ width: 100 }}>
              <button className = "styled-button" >
                User
              </button>
            </Link>
            <div className="divider"/>
            <Link to="signin/publisher" style={{ width: 100 }}>
              <button className = "styled-button">
                Publisher
              </button>
            </Link>
          </div>
       </div>
      </div> */}
      <Footer />
    </div>
  );
}

export default App;
