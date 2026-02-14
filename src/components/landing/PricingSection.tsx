"use client";

import { motion } from "framer-motion";

const plans = [
  {
    name: "Hobbyist",
    price: "$50",
    period: "/mo",
    description: "For individuals building side projects and prototypes.",
    features: [
      "Unlimited projects",
      "All generation features",
      "Community support",
      "Full export (Gerber, STL, C++, CSV)",
      "Commercial use",
    ],
    cta: "Start building",
    highlighted: false,
  },
  {
    name: "Prosumer",
    price: "$150",
    period: "/mo",
    description: "For professionals shipping real products.",
    features: [
      "Everything in Hobbyist",
      "Priority generation (2x throughput)",
      "Custom PCB layouts (5/month)",
      "Live engineering support",
      "API access (1,000 calls/month)",
      "Advanced simulation tools",
    ],
    cta: "Start building",
    highlighted: true,
  },
  {
    name: "Teams",
    price: "Custom",
    period: "",
    description: "For hardware teams that need shared workspaces and compliance.",
    features: [
      "Everything in Prosumer",
      "Unlimited seats",
      "SSO / SAML",
      "Dedicated account manager",
      "On-premise deployment",
      "White-label option",
    ],
    cta: "Talk to us",
    highlighted: false,
  },
];

export function PricingSection({ onStartBuilding }: { onStartBuilding: () => void }) {
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
            Pricing
          </p>
          <h2 className="mt-3 text-[clamp(1.6rem,3.5vw,2.5rem)] font-light leading-[1.1] tracking-[-0.02em] text-white">
            Simple, honest,{" "}
            <span className="text-white/30">no surprises.</span>
          </h2>
          <p className="mt-4 max-w-md text-[14px] leading-[1.7] text-white/30">
            Every plan includes a 14-day free trial.
            Cancel anytime. No contracts. No hidden fees.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-px bg-white/[0.05] md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`flex flex-col bg-[#08080C] p-6 ${
                plan.highlighted ? "bg-white/[0.02]" : ""
              }`}
            >
              {plan.highlighted && (
                <span className="mb-3 w-fit text-[9px] tracking-[0.2em] text-white/40 uppercase border border-white/10 px-2 py-0.5">
                  Recommended
                </span>
              )}
              <h3 className="text-[12px] tracking-[0.15em] text-white/50 uppercase">
                {plan.name}
              </h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-[32px] font-light tracking-[-0.02em] text-white">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-[13px] text-white/25">{plan.period}</span>
                )}
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-white/25">
                {plan.description}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[12px]">
                    <span className="mt-1.5 block h-1 w-1 shrink-0 rotate-45 bg-white/25" />
                    <span className="text-white/40">{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onStartBuilding}
                className={`mt-6 w-full py-2.5 text-[12px] tracking-[0.1em] uppercase transition-all ${
                  plan.highlighted
                    ? "bg-white text-[#08080C] hover:bg-white/90"
                    : "border border-white/[0.1] text-white/50 hover:border-white/20 hover:text-white/70"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
