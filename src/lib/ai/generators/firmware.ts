import { callGemini, extractCode } from "../gemini";
import { FIRMWARE_SYSTEM_PROMPT } from "../prompts";
import type { ConstraintData } from "@/lib/types";

export async function generateFirmware(prd: ConstraintData): Promise<string> {
  const { constraints, product_name } = prd;
  const { controller, sensors, actuators, battery_mah } =
    constraints.electrical;
  const { features, platform } = constraints.firmware;

  const prompt = `Generate production-grade firmware for: ${product_name}

SPECIFICATIONS:
- Controller: ${controller}
- Battery: ${battery_mah}mAh (optimize for power efficiency)
- Sensors: ${sensors.join(", ") || "none"}
- Actuators: ${actuators.join(", ") || "none"}
- Features: ${features.join(", ")}
- Target platform: ${platform}

Include: complete setup() and loop(), sensor reading with error handling, actuator control, battery monitoring, power optimization, serial debug output, network connectivity if WiFi/Bluetooth required.

Output ONLY the C++ code.`;

  const response = await callGemini(prompt, FIRMWARE_SYSTEM_PROMPT);
  return extractCode(response, "cpp") || extractCode(response, "c\\+\\+") || extractCode(response);
}
