"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Cpu, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Template } from "@/lib/types";

export default function NewProjectPage() {
  const [intent, setIntent] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  async function handleGenerate(promptText: string) {
    if (!promptText.trim()) return;
    setLoading(true);

    try {
      // Create project first
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Generating...", description: "" }),
      });
      const project = await projRes.json();

      if (!project.id) throw new Error("Failed to create project");

      // Trigger PRD generation (this generates everything)
      const genRes = await fetch(`/api/projects/${project.id}/generate-prd`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: promptText }),
      });

      if (!genRes.ok) throw new Error("Generation failed");

      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  const categoryIcons: Record<string, string> = {
    iot: "IoT",
    robotics: "Robotics",
    wearable: "Wearable",
    automation: "Automation",
  };

  return (
    <div className="mx-auto max-w-3xl p-8">
      <Link
        href="/projects"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="mb-8 text-center">
        <Cpu className="mx-auto mb-3 h-10 w-10 text-primary" />
        <h1 className="text-2xl font-bold">What do you want to build?</h1>
        <p className="mt-1 text-muted-foreground">
          Describe your hardware project and Blueprint will generate everything
        </p>
      </div>

      {/* Main prompt area */}
      <div className="mb-8 space-y-3">
        <Textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="e.g., Build a temperature logger with WiFi, battery-powered for 30 days, under $25"
          className="min-h-[120px] resize-none text-base"
          disabled={loading}
        />
        <Button
          onClick={() => handleGenerate(intent)}
          disabled={loading || !intent.trim()}
          className="w-full gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Generating design...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Project
            </>
          )}
        </Button>
      </div>

      {/* Templates */}
      {templates.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            Or start from a template
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((t) => (
              <Card
                key={t.id}
                className="cursor-pointer p-4 transition-colors hover:bg-accent/30"
                onClick={() => {
                  setIntent(t.initial_intent);
                  handleGenerate(t.initial_intent);
                }}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {categoryIcons[t.category] || t.category}
                  </span>
                </div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {t.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
