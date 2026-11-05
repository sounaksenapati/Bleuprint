import type { Metadata } from "next";
import { DemoExperience } from "@/components/demo/DemoExperience";

export const metadata: Metadata = {
  title: "Interactive product demo | Bleuprint",
  description: "Explore the five-step Bleuprint hardware product workflow.",
};

export default function DemoPage() {
  return <DemoExperience />;
}
