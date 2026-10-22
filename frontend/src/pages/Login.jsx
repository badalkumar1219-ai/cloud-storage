import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isRegistering) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setIsRegistering((current) => !current);
    setError("");
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-icon">☁️</span>
          <h1 className="login-logo-text">CloudBox</h1>
        </div>

        <p className="login-tagline">
          Secure cloud storage for your files, photos, and documents.
        </p>

        <h2 className="auth-title">
          {isRegistering ? "Create your account" : "Welcome back"}
        </h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label className="auth-field">
              Name
              <input
                type="text"
                autoComplete="name"
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          )}
          <label className="auth-field">
            Email
            <input
              type="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="auth-field">
            Password
            <input
              type="password"
              autoComplete={isRegistering ? "new-password" : "current-password"}
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {isRegistering && (
              <span className="auth-field-hint">Use at least 8 characters.</span>
            )}
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting
              ? "Please wait…"
              : isRegistering
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistering ? "Already have an account?" : "New to CloudBox?"}{" "}
          <button type="button" onClick={toggleMode}>
            {isRegistering ? "Sign in" : "Create an account"}
          </button>
        </p>

        <p className="login-footer">
          Your files are stored securely on AWS S3.
          <br />
          <small>Privacy Policy • Terms of Service</small>
        </p>
      </div>
    </div>
  );
}

export default Login;
