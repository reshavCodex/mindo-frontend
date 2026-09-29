import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import DashboardNav from "../components/dashboard/DashboardNav";
import { useAuth } from "../context/AuthContext";

const EASE = [0.22, 1, 0.36, 1];

// Soft staggered reveal for the settings header and cards.
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: EASE },
  }),
};

export default function Settings() {
  const { currentUser } = useAuth();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const displayName = currentUser?.displayName || "Mindo User";
  const email = currentUser?.email || "No email available";

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (!currentUser || !email) {
      setPasswordError("Unable to access your account.");
      return;
    }

    setPasswordLoading(true);

    try {
      const credential = EmailAuthProvider.credential(
        email,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess("Your password has been changed successfully.");
    } catch (error) {
      console.error("Password change failed:", error);

      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
          setPasswordError("Your current password is incorrect.");
          break;

        case "auth/weak-password":
          setPasswordError("New password must be at least 6 characters.");
          break;

        case "auth/too-many-requests":
          setPasswordError(
            "Too many attempts. Please wait a while and try again."
          );
          break;

        default:
          setPasswordError(
            "Unable to change your password. Please try again."
          );
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const closePasswordForm = () => {
    setShowPasswordForm(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess("");
  };

  return (
    <>
      <DashboardNav />

      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <div className="flex flex-col gap-8">
          {/* Page Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
          >
            <p className="text-sm font-semibold text-primary-deep">
              Account
            </p>

            <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
              Settings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft md:text-base">
              Manage your Mindo account and privacy preferences.
            </p>
          </motion.div>

          {/* Account */}
          <motion.section
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="rounded-3xl border border-line bg-white/60 p-6 shadow-soft md:p-8"
          >
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                Account
              </h2>

              <p className="mt-1 text-sm text-ink-soft">
                Basic information associated with your Mindo account.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Name */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Name
                </p>

                <p className="mt-2 text-sm font-medium text-ink">
                  {displayName}
                </p>
              </div>

              {/* Email */}
              <div className="border-t border-line pt-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  Email
                </p>

                <p className="mt-2 break-all text-sm font-medium text-ink">
                  {email}
                </p>
              </div>

              {/* Profile */}
              <div className="border-t border-line pt-5">
                <Link
                  to="/profile"
                  className="inline-flex items-center rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm font-medium text-ink-soft transition-[color,border-color,background-color,transform] duration-200 hover:border-primary/40 hover:text-ink active:scale-[0.97]"
                >
                  View profile
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Security */}
          <motion.section
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="rounded-3xl border border-line bg-white/60 p-6 shadow-soft md:p-8"
          >
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                Security
              </h2>

              <p className="mt-1 text-sm text-ink-soft">
                Keep your Mindo account secure.
              </p>
            </div>

            {!showPasswordForm ? (
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(true);
                  setPasswordSuccess("");
                  setPasswordError("");
                }}
                className="rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm font-medium text-ink-soft transition-[color,border-color,background-color,transform] duration-200 hover:border-primary/40 hover:text-ink active:scale-[0.97]"
              >
                Change password
              </button>
            ) : (
              <form
                onSubmit={handlePasswordChange}
                className="flex flex-col gap-5"
              >
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="text-sm font-medium text-ink"
                  >
                    Current password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-line bg-white/70 px-4 py-3 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-primary/50 focus:bg-white focus:shadow-soft"
                    required
                  />
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-ink"
                  >
                    New password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-line bg-white/70 px-4 py-3 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-primary/50 focus:bg-white focus:shadow-soft"
                    minLength={6}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-ink"
                  >
                    Confirm new password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-line bg-white/70 px-4 py-3 text-sm text-ink outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-primary/50 focus:bg-white focus:shadow-soft"
                    minLength={6}
                    required
                  />
                </div>

                {/* Error */}
                {passwordError && (
                  <p className="text-sm text-red-500" role="alert">
                    {passwordError}
                  </p>
                )}

                {/* Success */}
                {passwordSuccess && (
                  <p className="text-sm text-green-600" role="status">
                    {passwordSuccess}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-[opacity,transform,box-shadow] duration-200 hover:opacity-90 hover:shadow-soft active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
                  >
                    {passwordLoading
                      ? "Changing password..."
                      : "Change password"}
                  </button>

                  <button
                    type="button"
                    onClick={closePasswordForm}
                    className="rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm font-medium text-ink-soft transition-[color,border-color,background-color,transform] duration-200 hover:border-primary/40 hover:text-ink active:scale-[0.97]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </motion.section>

          {/* Privacy & Data */}
          <motion.section
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="rounded-3xl border border-line bg-white/60 p-6 shadow-soft md:p-8"
          >
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                Privacy &amp; Data
              </h2>

              <p className="mt-1 text-sm leading-6 text-ink-soft">
                Mindo will use your wellness session information to provide
                personalized experiences, insights, and reports.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-bg/50 p-4">
              <p className="text-sm font-medium text-ink">
                Session data controls
              </p>

              <p className="mt-1 text-sm leading-6 text-ink-soft">
                Session history and data-management controls will be available
                here once Mindo&apos;s session storage system is connected.
              </p>
            </div>
          </motion.section>

          {/* About */}
          <motion.section
            initial="hidden"
            animate="visible"
            custom={4}
            variants={fadeUp}
            className="rounded-3xl border border-line bg-white/60 p-6 shadow-soft md:p-8"
          >
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-ink">
                About Mindo
              </h2>

              <p className="mt-1 text-sm text-ink-soft">
                Your wellness companion for reflection and guided check-ins.
              </p>
            </div>

            <div className="flex flex-col gap-3 text-sm text-ink-soft">
              <p>
                Mindo is designed to help you reflect on your wellbeing through
                guided check-ins and supportive conversations.
              </p>

              <p className="font-medium text-ink">
                Mindo
              </p>
            </div>
          </motion.section>

          {/* Back */}
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-xl border border-line bg-white/60 px-4 py-2.5 text-sm font-medium text-ink-soft transition-[color,border-color,background-color,transform] duration-200 hover:border-primary/40 hover:text-ink active:scale-[0.97]"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}