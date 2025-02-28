import "./App.css";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./components/Home";
import Scene from "./components/Scene";
import Viewer from "./components/Viewer";
import ScenePage from "./components/Scene";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scene/:sceneId" element={<ScenePage />} />
      </Routes>
    </Router>
  );
}

export default App;
