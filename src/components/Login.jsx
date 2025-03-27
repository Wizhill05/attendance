import React from "react";

function Login({ loginForm, setLoginForm, handleLogin, isLoading }) {
  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Teacher Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              required
              className="input"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              required
              className="input"
            />
          </div>
          <button type="submit" className="button primary" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
