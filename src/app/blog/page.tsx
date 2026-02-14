import Link from "next/link";
import { Cpu, ArrowLeft } from "lucide-react";

const posts = [
  {
    title: "Why Hardware Development Needs an AI Revolution",
    excerpt: "The gap between software and hardware development tools has never been wider. Here's how AI can bridge it.",
    date: "Feb 10, 2025",
    readTime: "5 min read",
    tag: "Vision",
  },
  {
    title: "Introducing Constraint Propagation for Hardware",
    excerpt: "How a single parameter change can ripple across CAD, firmware, and BOM -- automatically.",
    date: "Feb 5, 2025",
    readTime: "8 min read",
    tag: "Engineering",
  },
  {
    title: "From Prompt to PCB: A Temperature Logger in 30 Minutes",
    excerpt: "A step-by-step walkthrough of building a complete IoT device using Bleuprint's AI generation.",
    date: "Jan 28, 2025",
    readTime: "12 min read",
    tag: "Tutorial",
  },
  {
    title: "The True Cost of Hardware Iteration",
    excerpt: "We analyzed 200 hardware projects to understand where time and money are actually spent.",
    date: "Jan 20, 2025",
    readTime: "6 min read",
    tag: "Research",
  },
  {
    title: "ESP32 vs RP2040: Choosing the Right Controller",
    excerpt: "A practical comparison for maker projects covering WiFi, power consumption, and ecosystem.",
    date: "Jan 15, 2025",
    readTime: "7 min read",
    tag: "Guide",
  },
  {
    title: "Building in Public: Our First 1000 Users",
    excerpt: "Lessons learned from our first month since launch, and what we're building next.",
    date: "Jan 8, 2025",
    readTime: "4 min read",
    tag: "Update",
  },
];

export default function BlogPage() {
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
          <span className="text-sm text-gray-400">Blog</span>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-100">Blog</h1>
        <p className="mt-2 text-gray-500">Thoughts on hardware, AI, and building</p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.title}
              className="group cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.04]"
            >
              <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-400">
                {post.tag}
              </span>
              <h2 className="mt-3 text-lg font-semibold text-gray-100 group-hover:text-purple-300">
                {post.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-600">
                <span>{post.date}</span>
                <span>&middot;</span>
                <span>{post.readTime}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
