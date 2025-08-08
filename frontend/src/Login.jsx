import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ setIsLoggedIn }) {
  const [isSignup, setIsSignup] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const url = isSignup
      ? "http://localhost:8000/signup"
      : "http://localhost:8000/login";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.detail || "Invalid credentials");
          return;
        }
        alert(data.message);
        setIsLoggedIn(true);
        navigate("/products");
      })
      .catch(() => setError("Server error"));
  }

  return (
    <div className="min-h-screen bg-gradient-to-t from-gray-200 to-gray-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">
          {isSignup ? "Sign Up" : "Login"}
        </h2>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-lg"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 rounded-full hover:bg-purple-800"
        >
          {isSignup ? "Sign Up" : "Login"}
        </button>
        {error && (
          <p className="text-red-600 text-center font-semibold">{error}</p>
        )}
        <p className="text-sm text-center">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            className="text-purple-700 font-semibold"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;