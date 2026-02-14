export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: "free" | "team" | "enterprise";
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  thumbnail_url: string;
}

export interface MechanicalConstraints {
  dimensions_mm: { x: number; y: number; z: number };
  weight_target_g: number;
  material: string;
}

export interface ElectricalConstraints {
  controller: string;
  battery_mah: number;
  battery_type: string;
  voltage: number;
  sensors: string[];
  actuators: string[];
}

export interface FirmwareConstraints {
  platform: string;
  features: string[];
}

export interface CostConstraints {
  target_usd: number;
  current_bom_usd?: number;
}

export interface BOMItem {
  component: string;
  quantity: number;
  estimated_cost: number;
  purpose: string;
  datasheet_url: string;
}

export interface ConstraintData {
  product_name: string;
  description: string;
  constraints: {
    mechanical: MechanicalConstraints;
    electrical: ElectricalConstraints;
    firmware: FirmwareConstraints;
    cost: CostConstraints;
  };
  bom: BOMItem[];
}

export interface Constraint {
  id: string;
  project_id: string;
  constraint_data: ConstraintData;
  version: number;
  created_at: string;
}

export interface Artifact {
  id: string;
  project_id: string;
  constraint_version: number;
  artifact_type: "cad" | "firmware" | "schematic" | "bom" | "prd";
  content: string;
  file_path: string;
  generated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: "iot" | "robotics" | "wearable" | "automation";
  initial_intent: string;
  thumbnail_url: string;
  is_featured: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  project_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export type ArtifactType = "cad" | "firmware" | "schematic" | "bom" | "prd";
