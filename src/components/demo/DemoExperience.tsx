"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, Box, Check, ChevronRight, CircuitBoard,
  Code2, Cpu, FileText, Layers3, LockKeyhole, Play, RotateCcw,
  Sparkles, Wrench,
} from "lucide-react";

const steps = [
  { label: "Describe", title: "Start with an idea", note: "A plain-language brief becomes the starting point for an engineering project." },
  { label: "Define", title: "Turn the brief into a specification", note: "Organise the problem into requirements, assumptions, and measurable constraints." },
  { label: "Design", title: "See the system take shape", note: "Explore the mechanical, electronics, and firmware workstreams together." },
  { label: "Generate", title: "Create the first deliverables", note: "Review draft artifacts in one workspace, with their assumptions visible." },
  { label: "Iterate", title: "Change one input. Revisit the design.", note: "Trace a constraint change through the artifacts it may affect." },
];

const initialBrief = "A compact indoor air-quality monitor with CO₂, temperature and humidity sensing, USB-C power, and a wall-mountable enclosure.";

export function DemoExperience() {
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState(initialBrief);
  const [sample, setSample] = useState(true);
  const [enclosureWidth, setEnclosureWidth] = useState(90);
  const [revision, setRevision] = useState(1);

  const cost = useMemo(() => (38.4 + (enclosureWidth - 90) * 0.08).toFixed(2), [enclosureWidth]);
  const next = () => setStep((s) => Math.min(4, s + 1));
  const previous = () => setStep((s) => Math.max(0, s - 1));

  return (
    <main className="min-h-screen bg-[#080a0e] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#080a0e]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-[0.18em]">◇ BLEUPRINT</Link>
          <div className="hidden text-xs text-white/40 sm:block">PRODUCT WALKTHROUGH <span className="px-2">/</span> 02 MIN</div>
          <Link href="/signup" className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/85">Create account <ArrowRight className="ml-1 inline h-3 w-3" /></Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[11px] font-semibold tracking-[0.24em] text-violet-300">FROM IDEA TO ENGINEERING STARTING POINT</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">One idea. Five steps.<br/><span className="text-white/45">A connected hardware workflow.</span></h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">Explore how Bleuprint connects product requirements, engineering constraints and first-pass deliverables in one workspace.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/55"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-400"/> Interactive sample · No API key required</div>
        </div>

        <div className="mb-6 grid grid-cols-5 gap-2">
          {steps.map((item, i) => (
            <button key={item.label} onClick={() => setStep(i)} className="group text-left">
              <div className={`mb-3 h-1 rounded-full transition-colors ${i <= step ? "bg-violet-400" : "bg-white/10"}`} />
              <div className={`text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-xs ${i === step ? "text-white" : "text-white/35 group-hover:text-white/65"}`}>{String(i + 1).padStart(2, "0")} <span className="hidden sm:inline">{item.label}</span></div>
            </button>
          ))}
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-[#10131a] lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border-b border-white/10 p-6 md:p-8 lg:border-b-0 lg:border-r">
            <div className="mb-8 flex items-center gap-2 text-xs text-violet-200"><Sparkles className="h-4 w-4"/> STEP 0{step + 1} / 05</div>
            <h2 className="text-2xl font-semibold">{steps[step].title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/50">{steps[step].note}</p>

            {step === 0 && <div className="mt-8">
              <label className="mb-2 block text-xs font-medium text-white/60">YOUR HARDWARE IDEA</label>
              <textarea value={brief} onChange={(e) => {setBrief(e.target.value);setSample(false);}} rows={5} className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 text-sm leading-6 text-white outline-none transition focus:border-violet-400" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => {setBrief(initialBrief);setSample(true);}} className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-white/55 hover:border-white/30">Load sample brief</button>
                <span className="self-center text-[11px] text-white/30">{brief.length}/500 characters</span>
              </div>
            </div>}

            {step === 1 && <div className="mt-8 space-y-3">
              {[["Product","Indoor air-quality monitor"],["Core function","CO₂, temperature & humidity"],["Power","5V USB-C"],["Form factor","Wall-mountable enclosure"],["Open question","Sensor calibration & airflow path"]].map(([k,v]) => <div key={k} className="flex justify-between gap-4 border-b border-white/[0.07] pb-3 text-xs"><span className="text-white/35">{k}</span><span className="text-right text-white/80">{v}</span></div>)}
              <p className="pt-2 text-[11px] text-amber-200/70">Illustrative specification. Engineering assumptions require review.</p>
            </div>}

            {step === 2 && <div className="mt-8 space-y-3">
              {[[CircuitBoard,"Electronics","Sensor, MCU, power and USB-C"],[Box,"Mechanical","Enclosure, mounting and airflow"],[Code2,"Firmware","Sampling, filtering and data output"]].map(([Icon,label,desc]) => {const I=Icon as typeof Cpu;return <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3"><div className="rounded-lg bg-violet-400/10 p-2 text-violet-200"><I className="h-4 w-4"/></div><div><div className="text-sm font-medium">{String(label)}</div><div className="mt-1 text-xs text-white/40">{String(desc)}</div></div><Check className="ml-auto h-4 w-4 text-emerald-300"/></div>})}
            </div>}

            {step === 3 && <div className="mt-8 space-y-3">
              {[["PRD","product-requirements.md",FileText],["CAD","enclosure.scad",Box],["Firmware","sensor-node.cpp",Code2],["BOM","components.csv",Layers3]].map(([label,file,Icon])=>{const I=Icon as typeof Cpu;return <div key={String(label)} className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-3"><I className="h-4 w-4 text-violet-200"/><div className="min-w-0"><div className="text-xs font-medium">{String(label)}</div><div className="truncate text-[11px] text-white/35">{String(file)}</div></div><span className="ml-auto text-[10px] text-emerald-300">DRAFT</span></div>})}
              <p className="text-[11px] text-white/35">Sample artifacts shown for the walkthrough; not generated live.</p>
            </div>}

            {step === 4 && <div className="mt-8">
              <div className="mb-3 flex items-center justify-between text-xs"><label className="text-white/55">ENCLOSURE WIDTH</label><strong>{enclosureWidth} mm</strong></div>
              <input type="range" min="70" max="120" step="5" value={enclosureWidth} onChange={(e)=>{setEnclosureWidth(Number(e.target.value));setRevision((v)=>v+1);}} className="w-full accent-violet-400"/>
              <div className="mt-2 flex justify-between text-[10px] text-white/30"><span>70 mm</span><span>120 mm</span></div>
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4"><div className="text-xs text-white/45">Estimated sample BOM total</div><div className="mt-1 text-2xl font-semibold">${cost}</div><div className="mt-2 text-[10px] text-white/30">Illustrative estimate · revision {revision}</div></div>
            </div>}

            <div className="mt-9 flex items-center gap-2">
              <button onClick={previous} disabled={step===0} className="rounded-full border border-white/15 px-4 py-2.5 text-xs text-white/65 disabled:opacity-25"><ArrowLeft className="mr-1 inline h-3 w-3"/> Back</button>
              {step < 4 ? <button onClick={next} className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-black hover:bg-white/85">Continue <ArrowRight className="ml-1 inline h-3 w-3"/></button> : <button onClick={()=>{setStep(0);setEnclosureWidth(90);setRevision(1);}} className="rounded-full border border-white/15 px-4 py-2.5 text-xs text-white/70"><RotateCcw className="mr-1 inline h-3 w-3"/> Replay demo</button>}
            </div>
          </div>

          <div className="min-h-[430px] bg-[radial-gradient(ellipse_at_50%_35%,rgba(124,92,240,0.12),transparent_55%)] p-6 md:p-8">
            <div className="mb-5 flex items-center justify-between"><div className="text-xs font-medium text-white/70">WORKSPACE PREVIEW</div><div className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/35">SAMPLE PROJECT</div></div>
            {step === 0 && <div className="flex h-[330px] flex-col items-center justify-center text-center"><div className="mb-5 rounded-2xl border border-violet-300/20 bg-violet-300/10 p-5"><Sparkles className="h-9 w-9 text-violet-200"/></div><div className="max-w-sm text-lg font-medium leading-7">From a sentence to a structured engineering brief.</div><p className="mt-3 max-w-sm text-xs leading-5 text-white/35">{sample ? "Sample brief loaded. Edit it on the left or continue to explore the workflow." : "Your edited brief is captured in this local demo. The live AI connection will be configured later."}</p></div>}
            {step === 1 && <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-5"><div className="mb-4 flex items-center gap-2 text-xs text-violet-200"><FileText className="h-4 w-4"/> PRODUCT REQUIREMENTS DOCUMENT</div><div className="text-xl font-semibold">Air quality monitor</div><p className="mt-2 text-xs leading-5 text-white/45">A compact indoor device that measures ambient CO₂, temperature and relative humidity, then exposes readings for local monitoring.</p><div className="mt-5 grid grid-cols-2 gap-3">{[["Sensors","3"],["Power","USB-C"],["Mount","Wall"],["Connectivity","TBD"]].map(([a,b])=><div key={a} className="rounded-lg bg-white/[0.04] p-3"><div className="text-[10px] text-white/35">{a}</div><div className="mt-1 text-sm font-medium">{b}</div></div>)}</div></div>
              <div className="rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4 text-xs text-amber-100/70">Assumptions and unresolved requirements are surfaced for review instead of silently treated as facts.</div>
            </div>}
            {step === 2 && <div className="flex h-[340px] flex-col justify-center gap-3">
              <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/[0.06] p-4"><Cpu className="h-5 w-5 text-violet-200"/><div><div className="text-xs font-semibold">Core controller</div><div className="text-[10px] text-white/35">MCU + sensor interfaces</div></div></div>
              <div className="mx-auto h-7 w-px bg-white/20"/>
              <div className="grid grid-cols-3 gap-2">{["CO₂ sensor","Temp / RH","USB-C power"].map((x)=><div key={x} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center text-[11px] text-white/65">{x}</div>)}</div>
              <div className="mx-auto h-7 w-px bg-white/20"/>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center"><Wrench className="mx-auto mb-2 h-5 w-5 text-violet-200"/><div className="text-xs font-medium">Enclosure & airflow path</div><div className="mt-1 text-[10px] text-white/35">Mounting · access · ventilation</div></div>
            </div>}
            {step === 3 && <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-[#080b11] p-4"><div className="mb-3 flex items-center gap-2 text-xs text-violet-200"><Code2 className="h-4 w-4"/> FIRMWARE PREVIEW</div><pre className="overflow-hidden text-[11px] leading-6 text-emerald-100/65">{`// illustrative sensor loop\nvoid loop() {\n  const auto co2 = sensor.readCO2();\n  const auto rh = sensor.readHumidity();\n  const auto temp = sensor.readTemperature();\n\n  publish({ co2, rh, temp });\n  delay(SAMPLE_INTERVAL_MS);\n}`}</pre></div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><div className="mb-2 text-xs text-white/55">BILL OF MATERIALS · SAMPLE</div>{[["CO₂ sensor module","$18.00"],["MCU board","$7.50"],["Temp / RH sensor","$4.20"],["Power & enclosure","$8.70"]].map(([a,b])=><div key={a} className="flex justify-between border-b border-white/[0.06] py-2 text-xs"><span className="text-white/55">{a}</span><span>{b}</span></div>)}</div>
            </div>}
            {step === 4 && <div className="flex h-[340px] flex-col justify-center">
              <div className="mx-auto mb-5 flex h-44 w-64 items-center justify-center rounded-[2rem] border border-violet-200/30 bg-gradient-to-br from-white/[0.12] to-white/[0.02] shadow-[0_20px_80px_rgba(124,92,240,0.12)]" style={{width:`${Math.max(190,enclosureWidth*2)}px`}}><div className="rounded-xl border border-white/10 bg-black/30 px-6 py-4 text-center"><div className="text-[10px] tracking-widest text-white/40">BLEUPRINT</div><div className="mt-2 text-2xl font-semibold">420 <span className="text-xs font-normal text-white/45">ppm</span></div><div className="mt-1 text-[9px] text-emerald-300/70">SAMPLE DISPLAY</div></div></div>
              <div className="text-center text-xs text-white/60">Constraint updated <span className="text-violet-200">→</span> dependent estimate refreshed</div>
              <div className="mt-3 flex justify-center gap-2 text-[10px] text-white/35"><span className="rounded-full border border-white/10 px-2 py-1">CAD draft</span><span className="rounded-full border border-white/10 px-2 py-1">BOM estimate</span><span className="rounded-full border border-white/10 px-2 py-1">Revision {revision}</span></div>
            </div>}
            <div className="mt-5 border-t border-white/[0.07] pt-4 text-[10px] leading-5 text-white/30">Demo data is illustrative and runs locally in your browser. No credentials are collected and no engineering outputs are validated in this walkthrough.</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:flex-row">
          <div><div className="text-sm font-semibold">Want to build with your own projects?</div><p className="mt-1 text-xs text-white/40">Create an account to explore the connected workspace.</p></div>
          <Link href="/signup" className="rounded-full bg-violet-300 px-5 py-3 text-xs font-semibold text-black hover:bg-violet-200">Get started <ChevronRight className="ml-1 inline h-3 w-3"/></Link>
        </div>
      </section>
    </main>
  );
}
