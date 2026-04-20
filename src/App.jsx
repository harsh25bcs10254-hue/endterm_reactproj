import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import PrivateRouter from "./components/PrivateRouter";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route 
            path="/login" 
            element={
              <div className="page-wrapper">
                <Login />
              </div>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <div className="page-wrapper">
                <Signup />
              </div>
            } 
          />

          <Route
            path="/"
            element={
              <PrivateRouter>
                <div className="page-wrapper">
                  <Dashboard />
                </div>
              </PrivateRouter>
            }
          />

          <Route
            path="/tasks"
            element={
              <PrivateRouter>
                <div className="page-wrapper">
                  <Tasks />
                </div>
              </PrivateRouter>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;