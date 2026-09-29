import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import AuthCard from "../components/auth/AuthCard";
import AuthInput from "../components/auth/AuthInput";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signup(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <AuthCard
        eyebrow="Get started"
        title="Create your account"
        subtitle="Your first five-minute check-in is just a moment away."
        footerText="Already have an account?"
        footerLinkText="Log in"
        footerLinkTo="/login"
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <AuthInput
            label="Name"
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
          />

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

          <AuthInput
            label="Password"
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </AuthCard>
    </>
  );
}