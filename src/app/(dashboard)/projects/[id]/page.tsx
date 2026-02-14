"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useWorkspaceStore } from "@/store/workspace-store";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const storeRef = useRef(useWorkspaceStore.getState());

  useEffect(() => {
    const store = useWorkspaceStore.getState();
    storeRef.current = store;
    store.reset();

    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        store.setProject(data.project);
        if (data.constraint) {
          store.setConstraints(data.constraint.constraint_data, data.constraint.version);
        }
        const artifactMap: Record<string, string> = {};
        for (const art of data.artifacts || []) {
          if (!artifactMap[art.artifact_type]) {
            artifactMap[art.artifact_type] = art.content;
          }
        }
        store.setArtifacts(artifactMap);
        store.setChatMessages(data.messages || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return <WorkspaceLayout projectId={id} />;
}
