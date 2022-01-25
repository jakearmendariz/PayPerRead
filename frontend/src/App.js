import './App.css';
import Welcome from "./components/Welcome"
import { Link } from 'react-router-dom'


function App() {

  return (
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
  );
}

export default App;
