import './App.css';
import { Link } from 'react-router-dom'

import Welcome from "../components/Welcome"
import Navbar from '../components/Navbar';
import { CookiesProvider } from 'react-cookie';

function App() {

  return (
    <CookiesProvider>
    <div>
      {/* <h1 className="mb-0 primary-font primary-color fw-bold">PayPerRead</h1>  */}
      <Navbar/>

      <div className="center-content">

      <div className="col-lg-2">  
        
        <h1 style={{paddingRight:"20px"}}>Are you a ...</h1>
        
          <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between",  }}>
            <Link to="signin/reader" style={{ width: 100 }}>
              <button className = "styled-button" >
                User
              </button>
            </Link>
            <div class="divider"/>
            <Link to="signin/publisher" style={{ width: 100 }}>
              <button className = "styled-button">
                Publisher
              </button>
            </Link>
          </div>
       </div>
      </div>

    </div>
    </CookiesProvider>
  );
}

export default App;
