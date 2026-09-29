import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [resetEmail, setResetEmail] = useState("");
  const [hasEmailAccess, setHasEmailAccess] = useState(false);

  const [error, setError] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          setError("Invalid email or password.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/user-disabled":
          setError("This account has been disabled.");
          break;

        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const openResetPassword = () => {
    setResetEmail(form.email || "");
    setResetError("");
    setResetSuccess("");
    setHasEmailAccess(false);
    setShowReset(true);
  };

  const backToLogin = () => {
    setResetError("");
    setResetSuccess("");
    setHasEmailAccess(false);
    setResetLoading(false);
    setShowReset(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setResetError("");
    setResetSuccess("");

    if (!resetEmail.trim()) {
      setResetError("Please enter your email address.");
      return;
    }

    if (!hasEmailAccess) {
      setResetError(
        "Please confirm that you have access to this email address."
      );
      return;
    }

    setResetLoading(true);

    try {
      await resetPassword(resetEmail.trim());

      setResetSuccess(
        "If an account exists for this email, a password reset link has been sent. Please check your inbox or spam folder."
      );
    } catch (err) {
      console.error(err);

      switch (err.code) {
        case "auth/invalid-email":
          setResetError("Please enter a valid email address.");
          break;

        case "auth/user-not-found":
          setResetError(
            "If an account exists for this email, a password reset link will be sent."
          );
          break;

        case "auth/user-disabled":
          setResetError(
            "This account has been disabled. Please contact support."
          );
          break;

        case "auth/too-many-requests":
          setResetError(
            "Too many reset attempts. Please wait a while and try again."
          );
          break;

        default:
          setResetError(
            "We couldn't send the reset link right now. Please try again."
          );
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <AuthCard
        eyebrow={showReset ? "Password recovery" : "Welcome back"}
        title={
          showReset
            ? "Reset your password"
            : "Log in to Mindo"
        }
        subtitle={
          showReset
            ? "Enter your email and we'll send you a password reset link."
            : "Pick up your wellness journey right where you left off."
        }
        footerText={showReset ? "" : "Don't have an account?"}
        footerLinkText={showReset ? "" : "Sign up"}
        footerLinkTo={showReset ? "" : "/signup"}
      >
        {showReset ? (
          <form
            className="flex flex-col gap-5"
            onSubmit={handleResetPassword}
          >
            <AuthInput
              label="Email"
              id="reset-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />

            <label
              htmlFor="email-access"
              className="
                flex cursor-pointer
                items-start gap-3
                text-sm text-ink-soft
              "
            >
              <input
                id="email-access"
                type="checkbox"
                checked={hasEmailAccess}
                onChange={(e) =>
                  setHasEmailAccess(e.target.checked)
                }
                className="
                  mt-0.5
                  h-4 w-4
                  shrink-0
                  cursor-pointer
                  rounded
                  border-gray-300
                  accent-primary-deep
                "
              />

              <span>
                I have access to this email address.
              </span>
            </label>

            {resetError && (
              <p
                className="text-sm text-red-500"
                role="alert"
              >
                {resetError}
              </p>
            )}

            {resetSuccess && (
              <p
                className="text-sm text-primary-deep"
                role="status"
              >
                {resetSuccess}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={resetLoading}
            >
              {resetLoading
                ? "Sending reset link..."
                : "Send reset link"}
            </Button>

            <button
              type="button"
              onClick={backToLogin}
              className="
                text-sm
                font-medium
                text-ink-soft
                transition-[color,transform]
                duration-200
                hover:text-ink
                active:scale-95
              "
            >
              ← Back to login
            </button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            <AuthInput
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <div className="flex flex-col gap-2">
              <AuthInput
                label="Password"
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={openResetPassword}
                  className="
                    text-sm
                    font-medium
                    text-primary-deep
                    transition-[color,transform]
                    duration-200
                    hover:text-ink
                    active:scale-95
                  "
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <p
                className="text-sm text-red-500"
                role="alert"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        )}
      </AuthCard>
    </>
  );
}