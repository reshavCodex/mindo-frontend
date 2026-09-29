import { motion } from "framer-motion";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/home/Hero";
import MindoOpening from "../components/home/MindoOpening";
import DashboardPreview from "../components/home/DashboardPreview";
import HowItWorks from "../components/home/HowItWorks";
import TechOverview from "../components/home/TechOverview";
import PrivacySection from "../components/home/PrivacySection";
import AboutSection from "../components/home/AboutSection";
import Resources from "../components/home/Resources";
import Disclaimer from "../components/home/Disclaimer";

function ScrollSection({
  children,
  className = "",
  ...props
}) {
  return (
    <motion.section
      className={className}
      {...props}
      initial={{
        opacity: 0,
        y: 28,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* =====================================================
            HERO — CALM
            ===================================================== */}

        <MindoOpening>
          <motion.div
            data-mindo-phase="calm"
            style={{
              y: 0,
            }}
          >
            <Hero />
          </motion.div>
        </MindoOpening>

        {/* =====================================================
            DASHBOARD PREVIEW — AWAKEN
            ===================================================== */}

        <ScrollSection data-mindo-phase="awaken">
          <DashboardPreview />
        </ScrollSection>

        {/* =====================================================
            HOW IT WORKS — CONNECT
            ===================================================== */}

        <ScrollSection data-mindo-phase="connect">
          <HowItWorks />
        </ScrollSection>

        {/* =====================================================
            TECHNOLOGY — INTELLIGENCE
            ===================================================== */}

        <ScrollSection data-mindo-phase="intelligence">
          <TechOverview />
        </ScrollSection>

        {/* =====================================================
            PRIVACY — RELEASE
            ===================================================== */}

        <ScrollSection data-mindo-phase="release">
          <PrivacySection />
        </ScrollSection>

        {/* =====================================================
            ABOUT
            ===================================================== */}

        <ScrollSection data-mindo-phase="about">
          <AboutSection />
        </ScrollSection>

        {/* =====================================================
            RESOURCES — SETTLED
            ===================================================== */}

        <ScrollSection data-mindo-phase="settled">
          <Resources />
        </ScrollSection>

        {/* =====================================================
            DISCLAIMER
            ===================================================== */}

        <ScrollSection data-mindo-phase="disclaimer">
          <Disclaimer />
        </ScrollSection>
      </main>

      <Footer />
    </>
  );
}