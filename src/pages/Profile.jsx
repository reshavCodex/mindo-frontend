import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import DashboardNav from "../components/dashboard/DashboardNav";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { currentUser } = useAuth();

  const displayName = currentUser?.displayName || "Mindo User";
  const email = currentUser?.email || "No email available";

  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "M";

  const creationTime = currentUser?.metadata?.creationTime;

  const memberSince = creationTime
    ? new Date(creationTime).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <>
      <DashboardNav />

      <main className="mx-auto max-w-5xl px-6 pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="flex flex-col gap-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="text-sm font-semibold text-primary-deep">
              Account
            </p>

            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Your MINDO profile
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft md:text-base">
              Your personal account information and MINDO account details,
              all in one place.
            </p>
          </motion.div>

          {/* Profile Hero */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              group relative overflow-hidden
              rounded-[2rem]
              border border-white/60
              bg-white/45
              p-6
              shadow-[0_20px_60px_-30px_rgba(72,61,145,0.28)]
              backdrop-blur-xl
              md:p-8
            "
          >
            {/* Decorative glow */}
            <div
              className="
                pointer-events-none absolute
                -right-20 -top-24
                h-64 w-64
                rounded-full
                bg-primary/10
                blur-3xl
              "
              aria-hidden="true"
            />

            <div
              className="
                pointer-events-none absolute
                -bottom-24 -left-20
                h-52 w-52
                rounded-full
                bg-purple-300/10
                blur-3xl
              "
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              {/* Identity */}
              <div className="flex items-center gap-5">
                <motion.div
                  whileHover={{
                    scale: 1.04,
                    rotate: 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="
                    relative flex h-20 w-20
                    shrink-0 items-center justify-center
                    overflow-hidden rounded-[1.5rem]
                    border border-white/70
                    bg-gradient-primary
                    shadow-[0_12px_30px_-14px_rgba(91,79,207,0.55)]
                  "
                >
                  <div
                    className="
                      absolute inset-0
                      bg-gradient-to-br
                      from-white/30
                      via-transparent
                      to-transparent
                    "
                    aria-hidden="true"
                  />

                  <span className="relative font-display text-2xl font-bold text-white">
                    {initials}
                  </span>
                </motion.div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">
                    MINDO member
                  </p>

                  <h2 className="mt-1 truncate font-display text-2xl font-bold text-ink md:text-3xl">
                    {displayName}
                  </h2>

                  <div className="mt-2 flex max-w-full items-center gap-2 text-sm text-ink-soft">
                    <Mail
                      size={15}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    <span className="truncate">
                      {email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div
                className="
                  inline-flex w-fit
                  items-center gap-2
                  rounded-full
                  border border-primary/15
                  bg-primary/8
                  px-3.5 py-2
                  text-sm font-semibold
                  text-primary-deep
                "
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="
                      absolute inline-flex h-full w-full
                      animate-ping rounded-full
                      bg-primary/50
                    "
                  />

                  <span
                    className="
                      relative inline-flex h-2 w-2
                      rounded-full bg-primary
                    "
                  />
                </span>

                Active account
              </div>
            </div>
          </motion.section>

          {/* Personal Information */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-ink">
                Personal information
              </h2>

              <p className="mt-1 text-sm text-ink-soft">
                Information associated with your MINDO account.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Name Card */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{
                  duration: 0.2,
                }}
                className="
                  rounded-3xl
                  border border-white/60
                  bg-white/50
                  p-5
                  shadow-[0_14px_40px_-26px_rgba(72,61,145,0.3)]
                  backdrop-blur-xl
                "
              >
                <div className="flex items-start gap-4">
                  <div
                    className="
                      flex h-11 w-11
                      shrink-0 items-center justify-center
                      rounded-2xl
                      bg-primary/10
                      text-primary-deep
                    "
                  >
                    <UserRound
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Full name
                    </p>

                    <p className="mt-1.5 break-words text-base font-semibold text-ink">
                      {displayName}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Email Card */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{
                  duration: 0.2,
                }}
                className="
                  rounded-3xl
                  border border-white/60
                  bg-white/50
                  p-5
                  shadow-[0_14px_40px_-26px_rgba(72,61,145,0.3)]
                  backdrop-blur-xl
                "
              >
                <div className="flex items-start gap-4">
                  <div
                    className="
                      flex h-11 w-11
                      shrink-0 items-center justify-center
                      rounded-2xl
                      bg-primary/10
                      text-primary-deep
                    "
                  >
                    <Mail
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Email address
                    </p>

                    <p className="mt-1.5 break-all text-base font-semibold text-ink">
                      {email}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Account Details */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.55,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-ink">
                Account details
              </h2>

              <p className="mt-1 text-sm text-ink-soft">
                A quick overview of your MINDO account.
              </p>
            </div>

            <div
              className="
                overflow-hidden
                rounded-3xl
                border border-white/60
                bg-white/50
                shadow-[0_14px_40px_-26px_rgba(72,61,145,0.3)]
                backdrop-blur-xl
              "
            >
              {/* Member Since */}
              <div className="flex items-center justify-between gap-5 px-5 py-5 md:px-6">
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-11 w-11
                      shrink-0 items-center justify-center
                      rounded-2xl
                      bg-primary/10
                      text-primary-deep
                    "
                  >
                    <CalendarDays
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Member since
                    </p>

                    <p className="mt-1 text-sm font-semibold text-ink">
                      {memberSince}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-5 border-t border-line/70 md:mx-6" />

              {/* Account Status */}
              <div className="flex items-center justify-between gap-5 px-5 py-5 md:px-6">
                <div className="flex items-center gap-4">
                  <div
                    className="
                      flex h-11 w-11
                      shrink-0 items-center justify-center
                      rounded-2xl
                      bg-primary/10
                      text-primary-deep
                    "
                  >
                    <ShieldCheck
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                      Account status
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <CheckCircle2
                        size={15}
                        strokeWidth={2}
                        className="text-primary"
                      />

                      <p className="text-sm font-semibold text-ink">
                        Active
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Back */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.2,
            }}
            className="pt-1"
          >
            <Link
              to="/dashboard"
              className="
                group
                inline-flex items-center gap-2
                rounded-xl
                border border-white/60
                bg-white/55
                px-4 py-2.5
                text-sm font-medium
                text-ink-soft
                shadow-[0_8px_24px_-18px_rgba(72,61,145,0.3)]
                backdrop-blur-xl
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-primary/30
                hover:bg-white/70
                hover:text-ink
                active:translate-y-0 active:scale-[0.97]
              "
            >
              <ArrowLeft
                size={16}
                strokeWidth={1.8}
                className="
                  transition-transform duration-200
                  group-hover:-translate-x-0.5
                "
              />

              Back to dashboard
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  );
}