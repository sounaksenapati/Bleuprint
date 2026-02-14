"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ProblemSection } from "./ProblemSection";
import { SolutionSection } from "./SolutionSection";
import { PricingSection } from "./PricingSection";
import { DemoModal } from "./DemoModal";

function Navbar({ onStartBuilding }: { onStartBuilding: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[#08080C]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative h-5 w-5">
            <div className="absolute inset-0 rotate-45 border border-white/80" />
            <div className="absolute inset-[3px] bg-white/90" style={{ clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }} />
          </div>
          <span className="text-[14px] font-medium tracking-[0.15em] text-white/90 uppercase">
            Bleuprint
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/blog" className="text-[12px] tracking-wide text-white/40 uppercase transition-colors hover:text-white/70">
            Journal
          </Link>
          <a href="#pricing" className="text-[12px] tracking-wide text-white/40 uppercase transition-colors hover:text-white/70">
            Pricing
          </a>
          <button
            onClick={onStartBuilding}
            className="border border-white/20 px-4 py-1.5 text-[12px] tracking-wide text-white/90 uppercase transition-all hover:border-white/40 hover:bg-white/[0.04]"
          >
            Try the demo
          </button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span className={`block h-px w-5 bg-white/60 transition-all ${mobileOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
          <span className={`block h-px w-5 bg-white/60 transition-all ${mobileOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-white/[0.06] bg-[#08080C]/95 px-6 py-6 md:hidden"
        >
          <div className="flex flex-col gap-5">
            <Link href="/blog" className="text-[12px] tracking-wide text-white/50 uppercase" onClick={() => setMobileOpen(false)}>
              Journal
            </Link>
            <a href="#pricing" className="text-[12px] tracking-wide text-white/50 uppercase" onClick={() => setMobileOpen(false)}>
              Pricing
            </a>
            <button
              onClick={() => { setMobileOpen(false); onStartBuilding(); }}
              className="border border-white/20 px-5 py-2.5 text-[12px] tracking-wide text-white/90 uppercase"
            >
              Try the demo
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

function HeroSection({ onStartBuilding }: { onStartBuilding: () => void }) {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pt-14">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute right-[10%] top-[15%] h-[280px] w-[280px] rounded-full border border-white/[0.03]" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 max-w-3xl text-center"
      >
        <p className="mb-5 text-[11px] tracking-[0.3em] text-white/30 uppercase">
          The unified hardware workspace
        </p>

        <h1 className="text-[clamp(2.2rem,6vw,4.5rem)] font-light leading-[0.95] tracking-[-0.03em] text-white">
          One description.
          <br />
          <span className="font-normal text-white/50">
            Every deliverable.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-md text-[15px] leading-[1.7] text-white/35 font-light">
          Bleuprint turns a plain-language brief into a synchronized set of PCB layouts,
          firmware, mechanical enclosures, and a costed bill of materials.
          Change one constraint and everything updates.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <button
            onClick={onStartBuilding}
            className="group flex items-center gap-3 bg-white px-7 py-3.5 text-[12px] font-medium tracking-[0.1em] text-[#08080C] uppercase transition-all hover:bg-white/90"
          >
            See it work
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </button>
          <a
            href="#problem"
            className="text-[12px] tracking-[0.1em] text-white/30 uppercase transition-colors hover:text-white/50"
          >
            Read the argument
          </a>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-1/2 h-12 w-px bg-gradient-to-b from-transparent to-white/10" />
    </section>
  );
}

function CTASection({ onStartBuilding }: { onStartBuilding: () => void }) {
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-[clamp(1.8rem,4.5vw,3rem)] font-light leading-[1.05] tracking-[-0.02em] text-white">
            The best hardware teams
            <br />
            will use fewer tools,{" "}
            <span className="text-white/40">not more.</span>
          </h2>
          <div className="mt-8">
            <button
              onClick={onStartBuilding}
              className="group inline-flex items-center gap-3 bg-white px-8 py-3.5 text-[12px] font-medium tracking-[0.1em] text-[#08080C] uppercase transition-all hover:bg-white/90"
            >
              Try Bleuprint free
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <p className="mt-4 text-[12px] text-white/25">
            No credit card. No 45-minute sales call. Just the tool.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Footer({ onStartBuilding }: { onStartBuilding: () => void }) {
  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto max-w-4xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <span className="text-[12px] font-medium tracking-[0.15em] text-white/60 uppercase">
              Bleuprint
            </span>
            <p className="mt-2 text-[12px] leading-relaxed text-white/25">
              The unified hardware workspace.
              <br />
              San Francisco, CA.
            </p>
          </div>
          <div>
            <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">Product</span>
            <ul className="mt-3 space-y-2">
              <li><button onClick={onStartBuilding} className="text-[12px] text-white/40 transition-colors hover:text-white/60">Start Building</button></li>
              <li><a href="#pricing" className="text-[12px] text-white/40 transition-colors hover:text-white/60">Pricing</a></li>
              <li><Link href="/blog" className="text-[12px] text-white/40 transition-colors hover:text-white/60">Journal</Link></li>
            </ul>
          </div>
          <div>
            <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">Company</span>
            <ul className="mt-3 space-y-2">
              <li><Link href="/contact" className="text-[12px] text-white/40 transition-colors hover:text-white/60">Contact</Link></li>
              <li><Link href="/terms" className="text-[12px] text-white/40 transition-colors hover:text-white/60">Terms</Link></li>
              <li><Link href="/privacy" className="text-[12px] text-white/40 transition-colors hover:text-white/60">Privacy</Link></li>
            </ul>
          </div>
          <div>
            <span className="text-[10px] tracking-[0.2em] text-white/30 uppercase">Connect</span>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="text-[12px] text-white/40 transition-colors hover:text-white/60">X / Twitter</a></li>
              <li><a href="#" className="text-[12px] text-white/40 transition-colors hover:text-white/60">GitHub</a></li>
              <li><a href="#" className="text-[12px] text-white/40 transition-colors hover:text-white/60">Discord</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-white/[0.04] pt-6">
          <span className="text-[11px] text-white/20">&copy; 2025 Bleuprint Inc.</span>
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-1 w-1 rotate-45 bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function LandingClient() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08080C] text-white antialiased">
      <Navbar onStartBuilding={() => setDemoOpen(true)} />
      <HeroSection onStartBuilding={() => setDemoOpen(true)} />
      <div id="problem">
        <ProblemSection />
      </div>
      <SolutionSection />
      <div id="pricing">
      <PricingSection onStartBuilding={() => setDemoOpen(true)} />
    </div>
    <CTASection onStartBuilding={() => setDemoOpen(true)} />
    <Footer onStartBuilding={() => setDemoOpen(true)} />
      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
