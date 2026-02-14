import { create } from "zustand";
import type {
  ConstraintData,
  Artifact,
  ChatMessage,
  Project,
} from "@/lib/types";

export type ViewerTab = "3d" | "firmware" | "bom" | "schematic" | "prd";

interface WorkspaceState {
  project: Project | null;
  constraints: ConstraintData | null;
  constraintVersion: number;
  artifacts: Record<string, string>;
  chatMessages: ChatMessage[];
  activeTab: ViewerTab;
  isGenerating: boolean;
  generatingArtifacts: Set<string>;
  isChatLoading: boolean;

  setProject: (project: Project) => void;
  setConstraints: (constraints: ConstraintData, version?: number) => void;
  setArtifact: (type: string, content: string) => void;
  setArtifacts: (artifacts: Record<string, string>) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  setActiveTab: (tab: ViewerTab) => void;
  setIsGenerating: (v: boolean) => void;
  setGeneratingArtifact: (type: string, generating: boolean) => void;
  setIsChatLoading: (v: boolean) => void;
  reset: () => void;
}

const initialState = {
  project: null,
  constraints: null,
  constraintVersion: 1,
  artifacts: {},
  chatMessages: [],
  activeTab: "3d" as ViewerTab,
  isGenerating: false,
  generatingArtifacts: new Set<string>(),
  isChatLoading: false,
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  ...initialState,

  setProject: (project) => set({ project }),
  setConstraints: (constraints, version) =>
    set((state) => ({
      constraints,
      constraintVersion: version ?? state.constraintVersion,
    })),
  setArtifact: (type, content) =>
    set((state) => ({
      artifacts: { ...state.artifacts, [type]: content },
    })),
  setArtifacts: (artifacts) =>
    set((state) => ({
      artifacts: { ...state.artifacts, ...artifacts },
    })),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setGeneratingArtifact: (type, generating) =>
    set((state) => {
      const next = new Set(state.generatingArtifacts);
      generating ? next.add(type) : next.delete(type);
      return { generatingArtifacts: next };
    }),
  setIsChatLoading: (v) => set({ isChatLoading: v }),
  reset: () => set(initialState),
}));
