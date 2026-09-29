import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-alt">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-primary opacity-60"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-6xl px-6 py-12"
      >
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/images/logo.png"
                alt="Mindo"
                className="h-7 w-7 rounded-full shadow-soft"
              />
              <span className="font-display text-base font-bold">Mindo</span>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              AI-assisted emotional wellness screening. Not a diagnostic
              service.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>
                <a href="#how-it-works" className="story-link hover:text-ink">
                  How it works
                </a>
              </li>
              <li>
                <a href="#technology" className="story-link hover:text-ink">
                  Technology
                </a>
              </li>
              <li>
                <a href="#resources" className="story-link hover:text-ink">
                  Resources
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Trust</h4>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li>
                <a href="#privacy" className="story-link hover:text-ink">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#disclaimer" className="story-link hover:text-ink">
                  Disclaimer
                </a>
              </li>
              <li>
                <a href="#about" className="story-link hover:text-ink">
                  About
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">In crisis?</h4>
            <p className="mt-3 text-sm text-ink-soft">
              If you're in immediate danger, contact local emergency services
              or a crisis helpline right away.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-6 text-s text-ink-soft">
          © {new Date().getFullYear()} Mindo.
          <strong> Designed and built by Team Nexus.</strong>
        </div>
      </motion.div>
    </footer>
  );
}