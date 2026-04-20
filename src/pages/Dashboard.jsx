import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <h1>📚 Student Helper Dashboard</h1>
      <p>Welcome, <strong>{user?.email}</strong></p>
      <div className="dashboard-actions">
        <button onClick={() => navigate("/tasks")}>📝 Go to Tasks</button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </div>
    </div>
  );
}
