import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const links = [
  {
    label: "Dashboard",
    to: "/dashboard",
    key: "dashboard",
  },
  {
    label: "Video Check-in",
    to: "/screening",
    key: "screening",
  },
  {
    label: "Chat",
    to: "/chat",
    key: "chat",
  },
  {
    label: "Insights",
    to: "/dashboard#insights",
    key: "insights",
  },
  {
    label: "Resources",
    to: "/resources",
    key: "resources",
  },
];

const SPRING = {
  type: "spring",
  stiffness: 400,
  damping: 25,
};

export default function DashboardNav() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const { currentUser, logout } = useAuth();

  const location = useLocation();
  const navigate = useNavigate();

  /* =====================================================
     ACTIVE NAVIGATION
  ===================================================== */

  const getActiveKey = () => {
    const pathname = location.pathname;
    const hash = location.hash;

    if (pathname === "/screening") {
      return "screening";
    }

    if (pathname === "/chat") {
      return "chat";
    }

    if (pathname === "/resources") {
      return "resources";
    }

    if (pathname === "/dashboard") {
      if (hash === "#insights") {
        return "insights";
      }

      return "dashboard";
    }

    return null;
  };

  const activeKey = getActiveKey();

  /* =====================================================
     SCROLL HIDE / REVEAL
  ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY <= 20) {
          setVisible(true);
        } else if (currentScrollY > lastScrollY.current + 4) {
          setVisible(false);
          setOpen(false);
          setProfileOpen(false);
        } else if (currentScrollY < lastScrollY.current - 4) {
          setVisible(true);
        }

        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
    };

    lastScrollY.current = window.scrollY;

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =====================================================
     HASH / SECTION NAVIGATION
  ===================================================== */

  useEffect(() => {
    if (!location.hash) return;

    const hash = location.hash;

    const scrollToDestination = () => {
      if (hash === "#insights") {
        const element =
          document.getElementById("insights");

        if (!element) return;

        const navbarOffset = 105;

        const elementTop =
          element.getBoundingClientRect().top +
          window.scrollY -
          navbarOffset;

        window.scrollTo({
          top: Math.max(0, elementTop),
          behavior: "smooth",
        });
      }
    };

    const timeout = window.setTimeout(
      scrollToDestination,
      50
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [location.hash]);

  /* =====================================================
     CLOSE MENU
  ===================================================== */

  const closeMenu = () => {
    setOpen(false);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    try {
      await logout();

      setProfileOpen(false);
      setOpen(false);

      window.location.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const displayName =
    currentUser?.displayName || "Mindo User";

  const email = currentUser?.email || "";

  return (
    <header
      className={`
        sticky
        top-0
        z-50
        px-4
        pt-3
        pb-4
        sm:px-6
        transition-transform
        duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]
        ${
          visible
            ? "translate-y-0"
            : "-translate-y-[calc(100%+0.75rem)]"
        }
      `}
    >
      {/* =====================================================
          FLOATING GLASS NAVBAR
      ===================================================== */}

      <nav
        className="
          pointer-events-auto
          relative
          mx-auto
          flex
          max-w-6xl
          items-center
          justify-between
          rounded-full
          border
          border-white/75
          bg-white/62
          px-4
          py-2.5
          shadow-[0_10px_40px_-18px_rgba(70,60,140,0.18)]
          backdrop-blur-2xl
          backdrop-saturate-150
          transition-all
          duration-300
          sm:px-5
          md:px-6
        "
      >
        {/* ===================================================
            LOGO
        =================================================== */}

        <Link
          to="/dashboard"
          className="
            group
            relative
            z-10
            flex
            shrink-0
            items-center
            gap-2.5
          "
        >
          <motion.span
            whileHover={{ scale: 1.05 }}
            transition={SPRING}
            className="
              relative
              flex
              h-8
              w-8
              items-center
              justify-center
            "
          >
            <img
              src="/images/logo.png"
              alt="Mindo"
              className="
                h-8
                w-8
                rounded-full
                shadow-[0_4px_18px_-6px_rgba(91,79,207,0.24)]
              "
            />

            <span
              className="
                pointer-events-none
                absolute
                inset-0
                rounded-full
                bg-primary/8
                opacity-0
                blur-md
                transition-opacity
                duration-300
                group-hover:opacity-100
              "
              aria-hidden="true"
            />
          </motion.span>

          <span
            className="
              font-display
              text-[17px]
              font-bold
              tracking-tight
              text-ink
            "
          >
            Mindo
          </span>
        </Link>

        {/* ===================================================
            DESKTOP NAVIGATION
        =================================================== */}

        <ul
          className="
            relative
            z-10
            hidden
            items-center
            gap-7
            md:flex
          "
        >
          {links.map((link) => {
            const isActive =
              activeKey === link.key;

            return (
              <li key={link.key}>
                <Link
                  to={link.to}
                  className="
                    relative
                    py-2
                    text-sm
                    font-medium
                    text-primary-deep
                    transition-all
                    duration-200
                    hover:text-primary
                  "
                >
                  <span
                    className={
                      isActive
                        ? "font-semibold"
                        : "font-medium"
                    }
                  >
                    {link.label}
                  </span>

                  {isActive && (
                    <motion.span
                      layoutId="dashboard-nav-active"
                      className="
                        absolute
                        -bottom-0.5
                        left-1/2
                        h-1
                        w-1
                        -translate-x-1/2
                        rounded-full
                        bg-primary
                      "
                      transition={SPRING}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ===================================================
            SETTINGS / PROFILE
        =================================================== */}

        <div className="relative z-30 hidden md:block">
          <motion.button
            type="button"
            aria-label="Profile and settings"
            aria-expanded={profileOpen}
            onClick={() =>
              setProfileOpen(
                (isOpen) => !isOpen
              )
            }
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            transition={SPRING}
            className={`
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              transition-[border-color,background-color,box-shadow]
              duration-300
              ${
                profileOpen
                  ? "border-primary/25 bg-white/80 shadow-[0_4px_16px_-8px_rgba(91,79,207,0.25)]"
                  : "border-white/80 bg-white/65 hover:border-white hover:bg-white/80"
              }
            `}
          >
            <span
              className="
                select-none
                text-[14px]
                leading-none
                opacity-60
                grayscale
              "
              aria-hidden="true"
            >
              ⚙️
            </span>
          </motion.button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -8,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: -8,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.18,
                  ease: "easeOut",
                }}
                className="
                  absolute
                  right-0
                  top-12
                  z-50
                  w-72
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/85
                  bg-white/95
                  shadow-[0_20px_55px_-18px_rgba(47,39,110,0.28)]
                  backdrop-blur-xl
                  backdrop-saturate-150
                "
              >
                <div
                  className="
                    border-b
                    border-black/[0.06]
                    px-5
                    py-4
                  "
                >
                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-ink
                    "
                  >
                    {displayName}
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      text-ink-soft
                    "
                  >
                    {email}
                  </p>
                </div>

                <div className="p-2">
                  <Link
                    to="/profile"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="
                      block
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      text-ink-soft
                      transition-colors
                      duration-200
                      hover:bg-black/[0.035]
                      hover:text-ink
                    "
                  >
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() =>
                      setProfileOpen(false)
                    }
                    className="
                      block
                      rounded-xl
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      text-ink-soft
                      transition-colors
                      duration-200
                      hover:bg-black/[0.035]
                      hover:text-ink
                    "
                  >
                    Settings
                  </Link>
                </div>

                <div
                  className="
                    border-t
                    border-black/[0.06]
                    p-2
                  "
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      w-full
                      rounded-xl
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      font-medium
                      text-red-500
                      transition-colors
                      duration-200
                      hover:bg-red-50
                    "
                  >
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===================================================
            MOBILE MENU BUTTON
        =================================================== */}

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          transition={SPRING}
          className={`
            relative
            z-10
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            transition-colors
            duration-200
            md:hidden
            ${
              open
                ? "border-primary/20 bg-white/75"
                : "border-white/80 bg-white/65"
            }
          `}
          onClick={() =>
            setOpen((isOpen) => !isOpen)
          }
          aria-label={
            open
              ? "Close menu"
              : "Open menu"
          }
          aria-expanded={open}
        >
          <motion.span
            className="
              absolute
              block
              h-px
              w-4
              bg-ink
            "
            animate={
              open
                ? { rotate: 45, y: 0 }
                : { rotate: 0, y: -3 }
            }
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
          />

          <motion.span
            className="
              absolute
              block
              h-px
              w-4
              bg-ink
            "
            animate={
              open
                ? { rotate: -45, y: 0 }
                : { rotate: 0, y: 3 }
            }
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
          />
        </motion.button>
      </nav>

      {/* =====================================================
          MOBILE NAVIGATION
      ===================================================== */}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
            className="
              pointer-events-auto
              relative
              z-40
              mx-auto
              mt-2
              max-w-6xl
              overflow-hidden
              rounded-3xl
              border
              border-white/85
              bg-white/95
              shadow-[0_20px_55px_-18px_rgba(47,39,110,0.25)]
              backdrop-blur-xl
              backdrop-saturate-150
              md:hidden
            "
          >
            <div className="p-3">
              <ul className="space-y-1">
                {links.map((link, index) => {
                  const isActive =
                    activeKey === link.key;

                  return (
                    <motion.li
                      key={link.key}
                      initial={{
                        opacity: 0,
                        x: -8,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.25,
                        delay: index * 0.04,
                      }}
                    >
                      <Link
                        to={link.to}
                        onClick={closeMenu}
                        className={`
                          flex
                          items-center
                          justify-between
                          rounded-2xl
                          px-4
                          py-3
                          text-sm
                          transition-colors
                          duration-200
                          ${
                            isActive
                              ? "bg-primary/10 font-semibold text-primary-deep"
                              : "font-medium text-primary-deep hover:bg-primary/5"
                          }
                        `}
                      >
                        <span>{link.label}</span>

                        {isActive && (
                          <span
                            className="
                              h-1.5
                              w-1.5
                              rounded-full
                              bg-primary
                            "
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <div
                className="
                  mt-2
                  border-t
                  border-black/[0.06]
                  pt-3
                "
              >
                <div
                  className="
                    rounded-2xl
                    bg-black/[0.025]
                    px-4
                    py-3
                  "
                >
                  <p
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-ink
                    "
                  >
                    {displayName}
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      text-ink-soft
                    "
                  >
                    {email}
                  </p>
                </div>

                <div className="mt-1 grid grid-cols-2 gap-1">
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="
                      rounded-2xl
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-ink-soft
                      transition-colors
                      hover:bg-black/[0.025]
                      hover:text-ink
                    "
                  >
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    onClick={closeMenu}
                    className="
                      rounded-2xl
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-ink-soft
                      transition-colors
                      hover:bg-black/[0.025]
                      hover:text-ink
                    "
                  >
                    Settings
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    mt-1
                    w-full
                    rounded-2xl
                    px-4
                    py-3
                    text-left
                    text-sm
                    font-medium
                    text-red-500
                    transition-colors
                    hover:bg-red-50
                  "
                >
                  Log out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}