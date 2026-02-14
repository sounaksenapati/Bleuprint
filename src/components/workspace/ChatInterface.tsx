"use client";

import { useState, useRef, useEffect } from "react";
import { useWorkspaceStore } from "@/store/workspace-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";

export function ChatInterface({ projectId }: { projectId: string }) {
  const {
    chatMessages,
    addChatMessage,
    isChatLoading,
    setIsChatLoading,
    constraints,
    setConstraints,
    setArtifacts,
    setIsGenerating,
  } = useWorkspaceStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  async function handleSend() {
    if (!input.trim() || isChatLoading) return;
    const message = input.trim();
    setInput("");
    setIsChatLoading(true);

    addChatMessage({
      id: crypto.randomUUID(),
      project_id: projectId,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    });

    try {
      const res = await fetch(`/api/projects/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      addChatMessage({
        id: crypto.randomUUID(),
        project_id: projectId,
        role: "assistant",
        content: data.response,
        created_at: new Date().toISOString(),
      });

      // If AI suggested constraint updates, apply them
      if (data.updates && constraints) {
        setIsGenerating(true);
        for (const update of data.updates) {
          const res = await fetch(
            `/api/projects/${projectId}/update-constraint`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                constraintPath: update.path,
                newValue: update.value,
              }),
            }
          );
          const result = await res.json();
          if (result.success) {
            setConstraints(result.updatedConstraints);
            setArtifacts(result.regeneratedArtifacts);
          }
        }
        setIsGenerating(false);
      }
    } catch {
      addChatMessage({
        id: crypto.randomUUID(),
        project_id: projectId,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        created_at: new Date().toISOString(),
      });
    }

    setIsChatLoading(false);
  }

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="border-b border-border/50 px-4 py-3">
        <h3 className="text-sm font-semibold">Chat</h3>
        <p className="text-xs text-muted-foreground">
          Describe changes to your design
        </p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {chatMessages.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Start a conversation to refine your design
            </div>
          )}
          {chatMessages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user" ? "bg-primary" : "bg-muted"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {msg.role === "user" ? "You" : "Blueprint AI"}
                </p>
                <div className="mt-0.5 text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-1 pt-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:0ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-3">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Make it waterproof..."
            className="min-h-[40px] max-h-[100px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isChatLoading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
