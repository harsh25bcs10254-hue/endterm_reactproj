import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Hide navbar on login and signup pages
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">📚</span>
          Student Helper
        </Link>

        {user && (
          <div className="navbar-menu">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/tasks" 
              className={`nav-link ${location.pathname === "/tasks" ? "active" : ""}`}
            >
              Tasks
            </Link>
            
            <div className="navbar-user">
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="nav-logout-btn">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
