"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FolderOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Project } from "@/lib/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function deleteProject(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Your hardware designs
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h2 className="mb-1 text-lg font-semibold">No projects yet</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Create your first hardware project or start from a template
          </p>
          <div className="flex gap-3">
            <Link href="/projects/new">
              <Button>Create Project</Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline">Browse Templates</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group cursor-pointer p-4 transition-colors hover:bg-accent/30"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="mb-3 flex h-32 items-center justify-center rounded-md bg-muted/50">
                <FolderOpen className="h-10 w-10 text-muted-foreground/30" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{project.name}</h3>
                  <p className="truncate text-xs text-muted-foreground">
                    {project.description || "No description"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject(project.id);
                  }}
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
