"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  FolderOpen,
  LayoutTemplate,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full w-56 flex-col border-r border-border/50 bg-card">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border/50 px-4">
        <Cpu className="h-5 w-5 text-primary" />
        <span className="font-bold">Blueprint</span>
      </div>

      {/* New Project */}
      <div className="p-3">
        <Link href="/projects/new">
          <Button size="sm" className="w-full gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              pathname.startsWith(item.href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-border/50 p-3">
        <p className="mb-2 truncate text-xs text-muted-foreground">
          {userEmail}
        </p>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
