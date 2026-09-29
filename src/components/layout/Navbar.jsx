import { useState, useEffect, useRef } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Technology", href: "#technology" },
  { label: "Privacy", href: "#privacy" },
  { label: "About", href: "#about" },
  { label: "Resources", href: "/resources" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [activeHash, setActiveHash] = useState("");

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;

      window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        const previousScrollY = lastScrollY.current;
        const scrollDifference = currentScrollY - previousScrollY;

        // Always show the navbar at the very top.
        if (currentScrollY <= 20) {
          setNavVisible(true);
        }

        // Hide only after meaningful downward movement.
        else if (scrollDifference > 6) {
          setNavVisible(false);
        }

        // Reveal when scrolling upward.
        else if (scrollDifference < -6) {
          setNavVisible(true);
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

  // Keep the navbar available while the mobile menu is open.
  useEffect(() => {
    if (open) {
      setNavVisible(true);
    }
  }, [open]);

  // Handle scrolling to homepage sections after navigation.
  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const sectionId = location.hash.substring(1);

    const scrollToSection = () => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    // Wait until the homepage has rendered after route navigation.
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(scrollToSection);
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveHash("");
      return;
    }

    const sections = links
      .filter((link) => link.href.startsWith("#"))
      .map((link) => document.querySelector(link.href))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find(
          (entry) => entry.isIntersecting
        );

        if (visibleSection) {
          setActiveHash(`#${visibleSection.target.id}`);
        }
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [location.pathname]);

  const closeMenu = () => {
    setOpen(false);
  };

  const handleSectionNavigation = (event, href) => {
    event.preventDefault();

    const sectionId = href.substring(1);

    // Already on the homepage:
    // preserve the original section-navigation behavior.
    if (location.pathname === "/") {
      const section = document.getElementById(sectionId);

      if (section) {
        window.history.pushState(
          null,
          "",
          href
        );

        window.dispatchEvent(new PopStateEvent("popstate"));

        section.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      closeMenu();
      return;
    }

    // From Login / Signup / any other page:
    // navigate to the homepage with the desired section hash.
    navigate(`/${href}`);

    closeMenu();
  };

  // MINDO logo behavior:
  // On the homepage, return to the very top.
  // On other pages, navigate to the homepage normally.
  const handleLogoClick = (event) => {
    if (location.pathname === "/") {
      event.preventDefault();

      window.history.replaceState(null, "", "/");

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 pointer-events-none">
        {/* Floating Glass Navigation */}
        <motion.nav
          initial={false}
          animate={{
            y: navVisible || open ? 0 : "-140%",
            opacity: navVisible || open ? 1 : 0,
            scale: navVisible || open ? 1 : 0.96,
          }}
          transition={{
            y: {
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: {
              duration: 0.28,
              ease: "easeOut",
            },
            scale: {
              duration: 0.42,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          className="
            pointer-events-auto
            relative mx-auto mt-3 flex max-w-6xl
            items-center justify-between
            rounded-full
            border border-white/45
            bg-white/38
            px-5 py-3
            backdrop-blur-2xl
            shadow-[0_10px_36px_-18px_rgba(72,61,145,0.3)]
          "
        >
          {/* Soft Glass Highlight */}
          <div
            className="
              pointer-events-none absolute inset-0
              rounded-full
              bg-gradient-to-b
              from-white/30
              via-transparent
              to-transparent
            "
            aria-hidden="true"
          />

          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="relative flex shrink-0 items-center gap-2"
          >
            <img
              src="/images/logo.png"
              alt="Mindo"
              className="
                h-8 w-8 rounded-full
                shadow-[0_3px_12px_-5px_rgba(91,79,207,0.4)]
              "
            />

            <span className="font-display text-lg font-bold text-ink">
              Mindo
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="relative hidden items-center gap-7 md:flex">
            {links.map((link) => {
              const isActive = activeHash === link.href;

              return (
                <li
                  key={link.href}
                  className="relative"
                >
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="
                        relative block py-1 text-sm
                        font-medium text-ink-soft
                        transition-colors duration-200
                        hover:text-ink
                      "
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(event) =>
                        handleSectionNavigation(
                          event,
                          link.href
                        )
                      }
                      className={`
                        relative block py-1 text-sm
                        transition-colors duration-200
                        ${
                          isActive
                            ? "font-semibold text-primary-deep"
                            : "font-medium text-ink-soft hover:text-ink"
                        }
                      `}
                    >
                      {link.label}
                    </a>
                  )}

                  {isActive && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="
                        absolute -bottom-1 left-0 h-0.5 w-full
                        rounded-full bg-gradient-primary
                      "
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop Actions */}
          <div className="relative hidden items-center gap-2 md:flex">
            <Button
              to="/login"
              variant="secondary"
            >
              Log in
            </Button>

            <Button
              to="/signup"
              variant="primary"
              size="sm"
            >
              Get started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="
              relative z-10 flex h-8 w-8
              items-center justify-center md:hidden
            "
            onClick={() => setOpen((isOpen) => !isOpen)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <motion.span
              className="absolute block h-0.5 w-6 bg-ink"
              animate={
                open
                  ? { rotate: 45, y: 0 }
                  : { rotate: 0, y: -4 }
              }
              transition={{ duration: 0.25 }}
            />

            <motion.span
              className="absolute block h-0.5 w-6 bg-ink"
              animate={
                open
                  ? { rotate: -45, y: 0 }
                  : { rotate: 0, y: 4 }
              }
              transition={{ duration: 0.25 }}
            />
          </button>
        </motion.nav>

        {/* Mobile Navigation */}
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
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                pointer-events-auto
                mx-4 mt-2 overflow-hidden
                rounded-3xl
                border border-white/45
                bg-white/40
                backdrop-blur-2xl
                shadow-[0_18px_45px_-20px_rgba(72,61,145,0.35)]
                md:hidden
              "
            >
              <ul className="flex flex-col gap-4 px-6 py-6">
                {links.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{
                      opacity: 0,
                      x: -12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                  >
                    {link.href.startsWith("/") ? (
                      <Link
                        to={link.href}
                        onClick={closeMenu}
                        className="
                          text-sm
                          font-medium text-ink-soft
                        "
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        onClick={(event) =>
                          handleSectionNavigation(
                            event,
                            link.href
                          )
                        }
                        className={`
                          text-sm
                          ${
                            activeHash === link.href
                              ? "font-semibold text-primary-deep"
                              : "font-medium text-ink-soft"
                          }
                        `}
                      >
                        {link.label}
                      </a>
                    )}
                  </motion.li>
                ))}

                <motion.li
                  initial={{
                    opacity: 0,
                    x: -12,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.3,
                    delay: links.length * 0.05,
                  }}
                >
                  <Button
                    to="/signup"
                    variant="primary"
                    size="sm"
                    onClick={closeMenu}
                  >
                    Get started
                  </Button>
                </motion.li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}