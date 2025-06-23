import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./components/pages/Home";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/galeria"
            element={
              <div className="text-white text-center py-20">
                🌌 Galeria APOD - Em construção
              </div>
            }
          />
          <Route
            path="/marte"
            element={
              <div className="text-white text-center py-20">
                🔴 Rovers de Marte - Em construção
              </div>
            }
          />
          <Route
            path="/asteroides"
            element={
              <div className="text-white text-center py-20">
                ☄️ Asteroides - Em construção
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
