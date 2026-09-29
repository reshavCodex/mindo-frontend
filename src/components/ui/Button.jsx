import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionLink = motion(Link);

const SPRING = { type: "spring", stiffness: 400, damping: 22 };

/**
 * Button
 * ------
 * Shared CTA button, extracted from the patterns previously duplicated
 * across Navbar.jsx and Hero.jsx.
 *
 * Variants:
 *  - "primary" (default): gradient pill, shimmer sweep on hover,
 *    spring scale on hover/tap. Matches the site's existing
 *    "Get started" / "Start your screening" buttons exactly.
 *  - "secondary": plain text, no background, color transition only.
 *    Matches the existing "Log in" link.
 *
 * Renders a react-router <Link> when `to` is provided (site
 * navigation), otherwise a real <button> (form submission on
 * Login/Signup) with the same visual treatment.
 *
 * Props:
 *  - to: string — route path, renders as <Link> when present.
 *  - type: "button" | "submit" — used when rendering as <button>.
 *  - variant: "primary" | "secondary".
 *  - size: "sm" | "md" — controls padding/text-size only.
 *  - fullWidth: boolean — stretches to 100% width (form submit buttons).
 */
export default function Button({
  to,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}) {
  const sizeClasses = size === "sm" ? "px-5 py-2 text-sm" : "px-6 py-3 text-sm";
  const widthClass = fullWidth ? "w-full" : "";

  // A disabled button (e.g. "Logging in...") should not react to hover/press.
  const isDisabled = Boolean(props.disabled);
  const hoverMotion = isDisabled ? undefined : { scale: 1.045 };
  const tapMotion = isDisabled ? undefined : { scale: 0.98 };

  if (variant === "secondary") {
    const secondaryClasses = `text-sm font-medium text-ink-soft transition-colors hover:text-ink ${className}`;
    return to ? (
      <Link to={to} className={secondaryClasses} {...props}>
        {children}
      </Link>
    ) : (
      <button type={type} className={secondaryClasses} {...props}>
        {children}
      </button>
    );
  }

  const primaryClasses = `group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-primary ${sizeClasses} ${widthClass} font-semibold text-white shadow-soft transition-[box-shadow,opacity] duration-300 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-soft ${className}`;

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      <span
        className="absolute inset-0 shimmer-bg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />
    </>
  );

  if (to) {
    return (
      <MotionLink
        to={to}
        whileHover={hoverMotion}
        whileTap={tapMotion}
        transition={SPRING}
        className={primaryClasses}
        {...props}
      >
        {inner}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      whileHover={hoverMotion}
      whileTap={tapMotion}
      transition={SPRING}
      className={primaryClasses}
      {...props}
    >
      {inner}
    </motion.button>
  );
}