"use client";

import { motion } from "framer-motion";

const steps = [
  {
    phase: "Input",
    title: "Describe",
    detail: "Plain language. No templates, no forms.",
    example: `"WiFi temperature logger for a greenhouse.\nBattery lasts 30 days. Waterproof.\nTotal BOM under $25."`,
  },
  {
    phase: "Structure",
    title: "Understand",
    detail: "The system parses constraints, resolves dependencies, builds a unified spec.",
    example: "Controller: ESP32-C3\nSensor: DHT22 (I2C)\nPower: Li-ion 2500mAh + TP4056\nEnclosure: IP65, 3D-printed PETG\nBudget: $23.95 allocated",
  },
];

const outputs = [
  { label: "PCB", description: "Schematic + layout, DRC-clean, Gerber-ready" },
  { label: "Firmware", description: "Compilable C++ with pin mappings that match the board" },
  { label: "Enclosure", description: "Parametric CAD with correct mounting holes and port cutouts" },
  { label: "BOM", description: "Costed, sourced, with supplier links and stock status" },
];

export function SolutionSection() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-[10px] tracking-[0.3em] text-white/25 uppercase">
            The solution
          </p>
          <h2 className="mt-3 text-[clamp(1.6rem,3.5vw,2.5rem)] font-light leading-[1.1] tracking-[-0.02em] text-white">
            One workspace.{" "}
            <span className="text-white/30">Complete synchronization.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[14px] leading-[1.7] text-white/30">
            Bleuprint maintains a single source of truth for your entire hardware project.
            When a constraint changes, every artifact regenerates.
            The firmware knows about the PCB. The enclosure knows about the board dimensions.
            The BOM reflects reality, not last week&apos;s spreadsheet.
          </p>
        </motion.div>

        {/* Flow steps */}
        <div className="mt-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="border-t border-white/[0.05] py-6"
            >
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div>
                  <span className="text-[10px] tracking-[0.2em] text-white/20 uppercase">
                    {step.phase}
                  </span>
                  <h3 className="mt-1 text-[17px] font-light text-white/80">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[12px] leading-relaxed text-white/30">
                    {step.detail}
                  </p>
                </div>
                <div className="border border-white/[0.06] bg-white/[0.015] p-4">
                  <pre className="whitespace-pre-wrap font-mono text-[12px] leading-[1.6] text-white/35">
                    {step.example}
                  </pre>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-white/[0.05]" />
        </div>

        {/* Parallel outputs */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12"
        >
          <p className="text-[10px] tracking-[0.3em] text-white/25 uppercase">
            Generate &mdash; simultaneously
          </p>
          <div className="mt-6 grid gap-px bg-white/[0.05] sm:grid-cols-2 md:grid-cols-4">
            {outputs.map((out) => (
              <div key={out.label} className="bg-[#08080C] p-5">
                <h4 className="text-[14px] font-medium text-white/70">
                  {out.label}
                </h4>
                <p className="mt-1.5 text-[12px] leading-[1.6] text-white/25">
                  {out.description}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* The punchline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 max-w-lg"
        >
          <div className="border-l border-white/[0.1] pl-5">
            <p className="text-[14px] leading-[1.7] text-white/40">
              &ldquo;Change the battery to 3000mAh.&rdquo;
            </p>
            <p className="mt-3 text-[15px] font-normal text-white/65">
              Enclosure resizes. Charge circuit updates. Firmware sleep timing recalculates.
              BOM re-costs. Thirty seconds. Zero mismatches.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
