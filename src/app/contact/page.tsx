"use client";

import { useState } from "react";
import Link from "next/link";
import { Cpu, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-gray-200">
      <nav className="border-b border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            <span className="bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text font-bold text-transparent">
              Bleuprint
            </span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-400">Contact</span>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-100">Get in touch</h1>
        <p className="mt-2 text-sm text-gray-500">
          We typically respond within 24 hours
        </p>

        {submitted ? (
          <div className="mt-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <p className="text-lg font-semibold text-emerald-400">
              Message sent!
            </p>
            <p className="mt-2 text-sm text-gray-400">
              We&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Name *
              </label>
              <input
                required
                type="text"
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-purple-500/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Email *
              </label>
              <input
                required
                type="email"
                className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-purple-500/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Subject
              </label>
              <select className="mt-1 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-purple-500/40">
                <option value="general">General</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="partnership">Partnership</option>
                <option value="press">Press</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">
                Message *
              </label>
              <textarea
                required
                minLength={20}
                rows={5}
                className="mt-1 w-full resize-none rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-gray-200 outline-none focus:border-purple-500/40"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-purple-500/25"
            >
              <Send className="h-4 w-4" />
              Send Message
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-gray-600">
          Prefer email?{" "}
          <a href="mailto:hello@bleuprint.app" className="text-purple-400">
            hello@bleuprint.app
          </a>
        </p>
      </div>
    </div>
  );
}
