import './App.css';
import { Link } from 'react-router-dom'

import Welcome from "../components/Welcome"
import { CookiesProvider } from 'react-cookie';

function App() {

  return (
    <CookiesProvider>
      <div style={{ padding: "30px" }}>
        <Welcome />

        <div>
          <p>I am a...</p>
          <div style={{ display: "flex", flexDirection: "row", width: 220, justifyContent: "space-between" }}>
            <Link to="/user">
              <button style={{ width: 100 }}>
                User
              </button>
            </Link>
            <Link to="/publisher">
              <button style={{ width: 100 }}>
                Publisher
              </button>
            </Link>
          </div>
        </div>

      </div>
    </CookiesProvider>
  );
}

export default App;
