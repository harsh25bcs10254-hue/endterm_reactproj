import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        setIsLoading(false);
        return;
      }
      await signup(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to sign up. Please check Firebase Authentication is enabled.");
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Sign Up</h1>
      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "0.75rem", borderRadius: "6px", fontSize: "0.875rem" }}>
          ⚠️ {error}
        </div>
      )}
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
        required
      />
      <input
        type="password"
        placeholder="Password (min 6 chars)"
        value={form.password}
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Signing up..." : "Sign Up"}
      </button>
      <a href="/login">Already have an account? Login</a>
    </form>
  );
}
