import "./App.css";
import ModelViewer from "./components/Viewer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import ScenePage from "./components/Scene";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scene/:sceneId" element={<ScenePage />} />
        </Routes>
      </Router>
      {/* <ModelViewer /> */}
    </>
  );
}

export default App;
