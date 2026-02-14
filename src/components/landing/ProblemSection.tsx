"use client";

import { motion } from "framer-motion";

const disciplines = [
  {
    number: "01",
    label: "Electronics",
    tool: "Altium, KiCad, Eagle",
    pain: "You route traces, place components, check design rules, export Gerbers. Then you change a capacitor and the schematic review starts again.",
  },
  {
    number: "02",
    label: "Firmware",
    tool: "VS Code, PlatformIO, Arduino",
    pain: "You write C++, flash the chip, debug over serial. When the pin mapping changes because the PCB changed, nobody tells you.",
  },
  {
    number: "03",
    label: "Sensors & I/O",
    tool: "Datasheets, forum posts, GitHub snippets",
    pain: "You copy-paste driver code from three different sources. It compiled yesterday. Today it doesn't. The I2C address was wrong all along.",
  },
  {
    number: "04",
    label: "Mechanical",
    tool: "Fusion 360, SolidWorks, OnShape",
    pain: "You model the enclosure around the PCB dimensions you were given last Tuesday. The PCB is now 3mm wider. The screw holes don't line up.",
  },
  {
    number: "05",
    label: "Power & BOM",
    tool: "Spreadsheets, supplier websites, prayer",
    pain: "You calculate power draw, order components, wait three weeks. The voltage regulator you chose is out of stock. The replacement has a different pinout.",
  },
];

export function ProblemSection() {
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
            The problem
          </p>
          <h2 className="mt-3 text-[clamp(1.6rem,3.5vw,2.5rem)] font-light leading-[1.1] tracking-[-0.02em] text-white">
            Five disciplines. Five tools.
            <br />
            <span className="text-white/30">Zero synchronization.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[14px] leading-[1.7] text-white/30">
            Every hardware project is a coordination problem disguised as an engineering problem.
            The real bottleneck is not your ability to design a circuit &mdash;
            it is your ability to keep the circuit, the firmware, the enclosure, and the BOM
            in agreement while all four are changing simultaneously.
          </p>
        </motion.div>

        <div className="mt-12">
          {disciplines.map((d, i) => (
            <motion.div
              key={d.number}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="border-t border-white/[0.05] py-5 md:py-6"
            >
              <div className="grid gap-3 md:grid-cols-[60px_160px_1fr]">
                <span className="text-[12px] tabular-nums text-white/15 font-light">
                  {d.number}
                </span>
                <div>
                  <h3 className="text-[14px] font-medium text-white/70">
                    {d.label}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-white/20">
                    {d.tool}
                  </p>
                </div>
                <p className="text-[13px] leading-[1.7] text-white/30 md:max-w-md">
                  {d.pain}
                </p>
              </div>
            </motion.div>
          ))}
          <div className="border-t border-white/[0.05]" />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 max-w-lg"
        >
          <p className="text-[10px] tracking-[0.3em] text-white/20 uppercase">
            The real cost
          </p>
          <h3 className="mt-3 text-[clamp(1.2rem,2.5vw,1.6rem)] font-light leading-[1.2] text-white/80">
            &ldquo;Change the battery to 3000mAh.&rdquo;
          </h3>
          <div className="mt-4 space-y-2 border-l border-white/[0.08] pl-5">
            <p className="text-[13px] text-white/30">Resize the enclosure cavity.</p>
            <p className="text-[13px] text-white/30">Recalculate the charge circuit.</p>
            <p className="text-[13px] text-white/30">Update the power budget spreadsheet.</p>
            <p className="text-[13px] text-white/30">Rewrite the deep-sleep timing in firmware.</p>
            <p className="text-[13px] text-white/30">Adjust the BOM, re-source, re-price.</p>
          </div>
          <p className="mt-6 text-[14px] font-light text-white/45">
            One sentence from a stakeholder. Five tools. Five manual updates. Five chances to introduce a mismatch
            that surfaces two weeks later on a $400 prototype run.
          </p>
          <p className="mt-3 text-[15px] font-normal text-white/65">
            This is why hardware takes months instead of days.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
