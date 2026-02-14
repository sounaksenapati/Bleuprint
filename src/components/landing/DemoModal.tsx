"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  X, Send, ChevronRight, Mail, Download,
  Keyboard, Headphones, Tv, Mic, Cloud,
  Cpu, Layers, FileCode, Box, Bug,
  Terminal, CircuitBoard, LayoutGrid,
  FlaskConical, TestTube, Calculator, Atom,
  Zap, Wifi, WifiOff,
} from "lucide-react";

/* ═══════════════════════════════════════
   PRESETS — 5 real hardware projects
   ═══════════════════════════════════════ */

interface Preset {
  icon: typeof Keyboard;
  title: string;
  brief: string;
  slug: string;
}

const presets: Preset[] = [
  { icon: Keyboard, title: "Build a Mechanical Keyboard", brief: "60% hot-swap, RGB, USB-C", slug: "keyboard" },
  { icon: Headphones, title: "Build a Headphone Amp", brief: "Class-A, 3.5mm + balanced output", slug: "headphone" },
  { icon: Tv, title: "Build an Alexa Remote", brief: "IR + BLE, voice trigger, CR2032", slug: "remote" },
  { icon: Mic, title: "Build a Voice Assistant", brief: "Wake word, speaker, WiFi, mic array", slug: "voice" },
  { icon: Cloud, title: "Build Your Own Cloud", brief: "ARM cluster, NAS, Docker-ready", slug: "cloud" },
];

/* ═══════════════════════════════════════
   WORKSPACE TABS — 4 spaces
   ═══════════════════════════════════════ */

type SpaceId = "electronics" | "cad" | "firmware" | "debug";
type ElecTab = "schematic" | "placement" | "gerber";
type CadTab = "viewer" | "simulation" | "testing" | "math";
type FwTab = "code" | "flash";

interface SpaceDef {
  id: SpaceId;
  icon: typeof Cpu;
  label: string;
}

const spaces: SpaceDef[] = [
  { id: "electronics", icon: CircuitBoard, label: "Electronics" },
  { id: "cad", icon: Box, label: "CAD" },
  { id: "firmware", icon: FileCode, label: "Firmware" },
  { id: "debug", icon: Bug, label: "Debug" },
];

/* ═══════════════════════════════════════
   PROJECT DATA — per preset
   ═══════════════════════════════════════ */

interface BomItem { component: string; qty: number; unit: number; total: number; footprint: string }
interface PlacementRow { ref: string; component: string; x: string; y: string; rotation: string; side: string }
interface FlashStep { step: number; title: string; command: string; note: string }
interface GerberLayer { name: string; color: string; elements: number; desc: string }
interface SimResult { parameter: string; value: string; status: "pass" | "warn" | "fail" }
interface TestCase { name: string; expected: string; actual: string; status: "pass" | "fail" }

interface ProjectData {
  name: string;
  desc: string;
  cost: string;
  mcu: string;
  // Schematic
  schematicBlocks: { name: string; pins: string[]; connections: string[] }[];
  netlist: string;
  // Placement
  placementRows: PlacementRow[];
  boardDims: { w: number; h: number; layers: number };
  // Gerber
  gerberLayers: GerberLayer[];
  // Firmware
  firmware: string;
  flashSteps: FlashStep[];
  // BOM
  bom: BomItem[];
  // CAD
  enclosure: { w: number; h: number; d: number; weight: string; material: string; mountHoles: number; printSettings: Record<string, string> };
  // Simulation
  simResults: SimResult[];
  // Testing
  testCases: TestCase[];
  // Math/Physics
  equations: { name: string; formula: string; result: string; unit: string }[];
  // Debug
  debugLog: string[];
}

const allProjects: Record<string, ProjectData> = {
  keyboard: {
    name: "60% Mechanical Keyboard",
    desc: "Hot-swap, per-key RGB, USB-C, QMK/VIA firmware, aluminum case",
    cost: "$42.60",
    mcu: "RP2040",
    schematicBlocks: [
      { name: "RP2040 MCU", pins: ["GPIO0-GPIO29", "USB_D+/D-", "3V3", "GND", "FLASH_CS"], connections: ["Key Matrix Rows (GPIO0-4)", "Key Matrix Cols (GPIO5-17)", "RGB Data (GPIO28)", "USB-C connector"] },
      { name: "Key Matrix (61 keys)", pins: ["ROW0-ROW4", "COL0-COL12"], connections: ["1N4148 diodes per key", "Hot-swap Kailh sockets"] },
      { name: "RGB (WS2812B x61)", pins: ["DIN", "DOUT", "VCC", "GND"], connections: ["Daisy-chain from GPIO28", "5V rail via MOSFET level shift"] },
      { name: "USB-C + ESD", pins: ["VBUS", "D+", "D-", "CC1", "CC2", "GND"], connections: ["USBLC6-2SC6 ESD protection", "5.1K CC resistors"] },
      { name: "Power", pins: ["5V_USB", "3V3_REG", "GND"], connections: ["AP2112K-3.3 LDO", "100uF + 100nF decoupling"] },
    ],
    netlist: `* Keyboard Netlist - 61 keys, RP2040
.subckt KEY_MATRIX
  ROW0 -> GPIO0 (RP2040 pin 2)
  ROW1 -> GPIO1 (RP2040 pin 3)
  ROW2 -> GPIO2 (RP2040 pin 4)
  ROW3 -> GPIO3 (RP2040 pin 5)
  ROW4 -> GPIO4 (RP2040 pin 6)
  COL0-COL12 -> GPIO5-GPIO17
  Each key: SW_n -> D_n(1N4148) -> ROW_n
.ends

.subckt USB_INTERFACE
  VBUS -> AP2112K_IN, USBLC6_VBUS
  D+ -> USBLC6_IO1 -> RP2040_USB_DP
  D- -> USBLC6_IO2 -> RP2040_USB_DM
  CC1 -> R_5K1 -> GND
  CC2 -> R_5K1 -> GND
.ends

.subckt RGB_CHAIN
  RP2040_GPIO28 -> SN74LVC1T45 -> WS2812B_1_DIN
  WS2812B_1_DOUT -> WS2812B_2_DIN -> ... -> WS2812B_61
  VCC_5V -> 100nF per LED -> WS2812B_VCC
.ends`,
    placementRows: [
      { ref: "U1", component: "RP2040", x: "142.00", y: "28.50", rotation: "0", side: "Bottom" },
      { ref: "U2", component: "W25Q16JV (Flash)", x: "152.00", y: "28.50", rotation: "0", side: "Bottom" },
      { ref: "U3", component: "AP2112K-3.3", x: "130.00", y: "20.00", rotation: "0", side: "Bottom" },
      { ref: "U4", component: "USBLC6-2SC6", x: "10.00", y: "25.00", rotation: "90", side: "Bottom" },
      { ref: "U5", component: "SN74LVC1T45", x: "135.00", y: "35.00", rotation: "0", side: "Bottom" },
      { ref: "J1", component: "USB-C 16P", x: "5.00", y: "28.50", rotation: "270", side: "Top" },
      { ref: "SW1-61", component: "Kailh Hot-swap", x: "grid", y: "19.05mm pitch", rotation: "0", side: "Top" },
      { ref: "D1-61", component: "1N4148W SOD-123", x: "per key", y: "per key", rotation: "varies", side: "Bottom" },
      { ref: "LED1-61", component: "WS2812B 5050", x: "per key", y: "centered", rotation: "0", side: "Bottom" },
      { ref: "C1-C8", component: "100nF 0402", x: "near ICs", y: "decoupling", rotation: "0", side: "Bottom" },
      { ref: "C9", component: "100uF 0805", x: "USB input", y: "bulk", rotation: "0", side: "Bottom" },
      { ref: "R1-R2", component: "5.1K 0402 (CC)", x: "near USB", y: "near USB", rotation: "0", side: "Bottom" },
      { ref: "Y1", component: "12MHz Crystal", x: "near RP2040", y: "near RP2040", rotation: "0", side: "Bottom" },
    ],
    boardDims: { w: 285, h: 95, layers: 2 },
    gerberLayers: [
      { name: "F.Cu (Front Copper)", color: "#e74c3c", elements: 134, desc: "Key switch pads, USB-C pads, ground fills" },
      { name: "B.Cu (Back Copper)", color: "#3498db", elements: 289, desc: "MCU routing, diode traces, RGB data chain, power planes" },
      { name: "F.SilkS (Front Silk)", color: "#f1c40f", elements: 72, desc: "Key labels, board name, revision, logo" },
      { name: "B.SilkS (Back Silk)", color: "#ffeb3b", elements: 45, desc: "Component references, orientation marks" },
      { name: "F.Mask (Solder Mask)", color: "#9b59b6", elements: 134, desc: "Pad openings for hot-swap sockets" },
      { name: "B.Mask (Solder Mask)", color: "#2ecc71", elements: 289, desc: "Pad openings for SMD components" },
      { name: "Edge.Cuts (Board Outline)", color: "#ecf0f1", elements: 8, desc: "285x95mm, chamfered corners, USB cutout" },
      { name: "Drill (PTH + NPTH)", color: "#e67e22", elements: 196, desc: "Hot-swap socket holes (x122), mounting (x5), USB shield (x4)" },
    ],
    firmware: `// QMK Firmware — 60% Keyboard
// Target: RP2040, Matrix: 5x13

#include QMK_KEYBOARD_H

#define _BASE 0
#define _FN   1

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
  [_BASE] = LAYOUT_60_ansi(
    KC_ESC,  KC_1,  KC_2,  KC_3,  KC_4,  KC_5,  KC_6,  KC_7,  KC_8,  KC_9,  KC_0,  KC_MINS, KC_EQL,  KC_BSPC,
    KC_TAB,  KC_Q,  KC_W,  KC_E,  KC_R,  KC_T,  KC_Y,  KC_U,  KC_I,  KC_O,  KC_P,  KC_LBRC, KC_RBRC, KC_BSLS,
    KC_CAPS, KC_A,  KC_S,  KC_D,  KC_F,  KC_G,  KC_H,  KC_J,  KC_K,  KC_L,  KC_SCLN, KC_QUOT, KC_ENT,
    KC_LSFT, KC_Z,  KC_X,  KC_C,  KC_V,  KC_B,  KC_N,  KC_M,  KC_COMM, KC_DOT, KC_SLSH, KC_RSFT,
    KC_LCTL, KC_LGUI, KC_LALT,          KC_SPC,           KC_RALT, MO(_FN), KC_APP, KC_RCTL
  ),

  [_FN] = LAYOUT_60_ansi(
    KC_GRV,  KC_F1,  KC_F2,  KC_F3,  KC_F4,  KC_F5,  KC_F6,  KC_F7,  KC_F8,  KC_F9,  KC_F10, KC_F11, KC_F12, KC_DEL,
    _______, RGB_TOG, RGB_MOD, RGB_HUI, RGB_SAI, RGB_VAI, _______, KC_PGUP, KC_UP,  KC_PGDN, KC_PSCR, _______, _______, _______,
    _______, _______, _______, _______, _______, _______, KC_HOME, KC_LEFT, KC_DOWN, KC_RGHT, KC_END, _______, _______,
    _______, _______, _______, _______, _______, _______, _______, KC_MUTE, KC_VOLD, KC_VOLU, _______, _______,
    _______, _______, _______,          _______,          _______, _______, _______, _______
  ),
};

// RGB configuration
void keyboard_post_init_user(void) {
  rgblight_enable();
  rgblight_sethsv(170, 255, 128);  // blue, full sat, half bright
  rgblight_mode(RGBLIGHT_MODE_RAINBOW_SWIRL);
}

// Per-key RGB reactions
bool process_record_user(uint16_t keycode, keyrecord_t *record) {
  if (record->event.pressed) {
    uint8_t row = record->event.key.row;
    uint8_t col = record->event.key.col;
    uint8_t led_idx = row * MATRIX_COLS + col;
    rgb_matrix_set_color(led_idx, 255, 255, 255);
  }
  return true;
}`,
    flashSteps: [
      { step: 1, title: "Install QMK toolchain", command: "python3 -m pip install qmk\nqmk setup", note: "Installs ARM GCC, make, and QMK CLI" },
      { step: 2, title: "Create keyboard config", command: "qmk new-keyboard -kb bleuprint/kb60 -t rp2040", note: "Generates info.json, rules.mk, keymaps/" },
      { step: 3, title: "Enter bootloader mode", command: "Hold BOOT + tap RESET on PCB", note: "RP2040 appears as USB mass storage (RPI-RP2)" },
      { step: 4, title: "Compile firmware", command: "qmk compile -kb bleuprint/kb60 -km default", note: "Output: bleuprint_kb60_default.uf2 (~72KB)" },
      { step: 5, title: "Flash firmware", command: "cp bleuprint_kb60_default.uf2 /Volumes/RPI-RP2/", note: "Drag-and-drop. Board reboots automatically." },
      { step: 6, title: "Verify keymap", command: "Open VIA app -> Auto-detect", note: "All 61 keys should register. Test each row." },
      { step: 7, title: "Test RGB", command: "Fn + Q to toggle RGB, Fn + W to cycle modes", note: "All 61 LEDs should illuminate. Check for dead LEDs." },
    ],
    bom: [
      { component: "RP2040 MCU", qty: 1, unit: 0.70, total: 0.70, footprint: "QFN-56" },
      { component: "W25Q16JV Flash 16Mbit", qty: 1, unit: 0.40, total: 0.40, footprint: "SOIC-8" },
      { component: "AP2112K-3.3 LDO", qty: 1, unit: 0.15, total: 0.15, footprint: "SOT-23-5" },
      { component: "USBLC6-2SC6 ESD", qty: 1, unit: 0.20, total: 0.20, footprint: "SOT-23-6" },
      { component: "SN74LVC1T45 Level Shift", qty: 1, unit: 0.15, total: 0.15, footprint: "SOT-23-5" },
      { component: "12MHz Crystal 3215", qty: 1, unit: 0.10, total: 0.10, footprint: "3215" },
      { component: "USB-C 16P Connector", qty: 1, unit: 0.80, total: 0.80, footprint: "USB-C-16P" },
      { component: "Kailh Hot-swap Socket", qty: 61, unit: 0.12, total: 7.32, footprint: "Kailh-HS" },
      { component: "1N4148W Diode", qty: 61, unit: 0.02, total: 1.22, footprint: "SOD-123" },
      { component: "WS2812B-5050 RGB LED", qty: 61, unit: 0.06, total: 3.66, footprint: "5050" },
      { component: "100nF 0402 Cap", qty: 70, unit: 0.005, total: 0.35, footprint: "0402" },
      { component: "100uF 0805 Cap", qty: 2, unit: 0.08, total: 0.16, footprint: "0805" },
      { component: "5.1K 0402 Resistor", qty: 2, unit: 0.005, total: 0.01, footprint: "0402" },
      { component: "PCB 2-layer (285x95mm)", qty: 1, unit: 5.00, total: 5.00, footprint: "PCB" },
      { component: "Stabilizers (2u, 6.25u)", qty: 5, unit: 0.80, total: 4.00, footprint: "Plate-mount" },
    ],
    enclosure: { w: 295, h: 105, d: 32, weight: "380g", material: "Aluminum 6061 (CNC) + Acrylic diffuser", mountHoles: 5, printSettings: { "CNC Material": "6061-T6 Aluminum", "Finish": "Anodized black", "Plate": "1.5mm FR4 or Aluminum", "Diffuser": "2mm frosted acrylic", "Feet": "Silicone bump-on (4x)", "Typing angle": "6 degrees" } },
    simResults: [
      { parameter: "USB-C signal integrity (D+/D-)", value: "Eye diagram: open, 78% margin", status: "pass" },
      { parameter: "3.3V rail ripple under load", value: "12mV pp (spec: <50mV)", status: "pass" },
      { parameter: "RGB chain propagation delay", value: "18.3us for 61 LEDs (budget: 20us)", status: "pass" },
      { parameter: "Key matrix scan rate", value: "1.2ms full scan (833Hz)", status: "pass" },
      { parameter: "Hot-swap socket insertion force", value: "3.2N (spec: 2.5-4.0N)", status: "pass" },
      { parameter: "Thermal (MCU under full RGB)", value: "52C junction (max: 85C)", status: "pass" },
    ],
    testCases: [
      { name: "Every key registers uniquely", expected: "61 unique keycodes", actual: "61 unique keycodes", status: "pass" },
      { name: "N-key rollover", expected: "6KRO minimum", actual: "Full NKRO via USB", status: "pass" },
      { name: "RGB all-white power draw", expected: "<2.5A @ 5V", actual: "2.1A measured", status: "pass" },
      { name: "USB enumeration time", expected: "<500ms", actual: "180ms", status: "pass" },
      { name: "Debounce effectiveness", expected: "No chatter in 10K presses", actual: "0 chatter events", status: "pass" },
      { name: "VIA live remap", expected: "Keymap changes in <100ms", actual: "~40ms", status: "pass" },
    ],
    equations: [
      { name: "Matrix scan time", formula: "T = rows x cols x t_settle", result: "5 x 13 x 18us = 1.17ms", unit: "ms" },
      { name: "RGB power consumption", formula: "P = N x I_per_led x V", result: "61 x 60mA x 5V = 18.3W (max)", unit: "W" },
      { name: "Debounce period", formula: "t = N_samples x T_scan", result: "5 x 1.17ms = 5.85ms", unit: "ms" },
      { name: "USB polling rate", formula: "f = 1 / bInterval", result: "1 / 1ms = 1000Hz", unit: "Hz" },
      { name: "Thermal rise (MCU)", formula: "dT = P_diss x Rth_ja", result: "0.18W x 45C/W = 8.1C above ambient", unit: "C" },
    ],
    debugLog: [
      "[00:00.000] RP2040 boot: flash 16Mbit, clock 125MHz",
      "[00:00.004] USB: CDC+HID composite device initialized",
      "[00:00.006] Matrix: 5 rows x 13 cols = 61 keys configured",
      "[00:00.008] RGB: WS2812B chain x61, DMA channel 0",
      "[00:00.010] QMK: keymap layers loaded (BASE, FN)",
      "[00:00.012] USB: enumerated as Bleuprint KB60 (VID:0xFEED PID:0x6060)",
      "[00:00.180] USB: host configured, HID ready",
      "[00:00.200] Matrix scan: 1.17ms/cycle (855Hz)",
      "[00:01.000] RGB: mode RAINBOW_SWIRL, HSV(170,255,128)",
      "[00:01.500] Key event: ROW2 COL6 pressed -> KC_H",
      "[00:01.508] Key event: ROW2 COL6 released",
      "[00:02.000] VIA: protocol version 0x0C, ready",
    ],
  },

  headphone: {
    name: "Class-A Headphone Amplifier",
    desc: "Discrete Class-A output stage, 3.5mm SE + 4.4mm balanced, USB-C DAC input, volume encoder",
    cost: "$38.70",
    mcu: "PCM5102A DAC + NE5532 opamp",
    schematicBlocks: [
      { name: "USB-C Audio Input", pins: ["VBUS", "D+", "D-", "GND"], connections: ["PCM2706 USB audio codec", "I2S bus to DAC"] },
      { name: "DAC (PCM5102A)", pins: ["BCK", "LRCK", "DIN", "VOUT_L", "VOUT_R"], connections: ["I2S from USB codec", "Analog output to pre-amp"] },
      { name: "Pre-amplifier (NE5532)", pins: ["IN+", "IN-", "OUT", "V+", "V-"], connections: ["Volume control (ALPS encoder)", "Gain: 2x (6dB)"] },
      { name: "Output Stage (Class-A)", pins: ["IN", "OUT", "BIAS", "V+", "V-"], connections: ["BD139/BD140 push-pull", "47R emitter resistors", "20mA quiescent bias"] },
      { name: "Power Supply", pins: ["+15V", "-15V", "GND"], connections: ["Mean Well IRM-10-15 AC/DC", "TL072 virtual ground for split rail"] },
    ],
    netlist: `* Headphone Amp Netlist
.subckt DAC_STAGE
  USB_D+ -> PCM2706_DP
  USB_D- -> PCM2706_DM
  PCM2706_I2S_BCK -> PCM5102A_BCK
  PCM2706_I2S_LRCK -> PCM5102A_LRCK
  PCM2706_I2S_DOUT -> PCM5102A_DIN
  PCM5102A_VOUT_L -> C_coupling_100uF -> PRE_IN_L
  PCM5102A_VOUT_R -> C_coupling_100uF -> PRE_IN_R
.ends

.subckt OUTPUT_STAGE_L
  PRE_OUT_L -> R_input_1K -> Q1_BD139_base
  Q1_BD139_emitter -> R_emitter_47R -> OUT_L
  Q2_BD140_emitter -> R_emitter_47R -> OUT_L
  BIAS: 2x 1N4148 + R_bias_2K2 -> 20mA Iq
.ends`,
    placementRows: [
      { ref: "U1", component: "PCM2706 USB Codec", x: "15.00", y: "20.00", rotation: "0", side: "Top" },
      { ref: "U2", component: "PCM5102A DAC", x: "35.00", y: "20.00", rotation: "0", side: "Top" },
      { ref: "U3", component: "NE5532 Pre-amp", x: "55.00", y: "15.00", rotation: "0", side: "Top" },
      { ref: "U4", component: "NE5532 Pre-amp", x: "55.00", y: "25.00", rotation: "0", side: "Top" },
      { ref: "Q1-Q2", component: "BD139/BD140 (L ch)", x: "75.00", y: "12.00", rotation: "0", side: "Top" },
      { ref: "Q3-Q4", component: "BD139/BD140 (R ch)", x: "75.00", y: "28.00", rotation: "0", side: "Top" },
      { ref: "J1", component: "USB-C 16P", x: "5.00", y: "20.00", rotation: "270", side: "Top" },
      { ref: "J2", component: "3.5mm TRS Jack", x: "90.00", y: "12.00", rotation: "0", side: "Top" },
      { ref: "J3", component: "4.4mm Pentaconn", x: "90.00", y: "28.00", rotation: "0", side: "Top" },
      { ref: "SW1", component: "ALPS EC11 Encoder", x: "50.00", y: "38.00", rotation: "0", side: "Top" },
    ],
    boardDims: { w: 100, h: 45, layers: 4 },
    gerberLayers: [
      { name: "F.Cu (Signal)", color: "#e74c3c", elements: 156, desc: "Audio signal routing, component pads" },
      { name: "In1.Cu (GND Plane)", color: "#27ae60", elements: 4, desc: "Continuous ground plane for noise shielding" },
      { name: "In2.Cu (Power)", color: "#e67e22", elements: 12, desc: "+15V, -15V, +5V split power planes" },
      { name: "B.Cu (Signal)", color: "#3498db", elements: 98, desc: "DAC digital routing, USB traces" },
      { name: "F.SilkS", color: "#f1c40f", elements: 38, desc: "Component labels, audio path markings" },
      { name: "F.Mask", color: "#9b59b6", elements: 156, desc: "Pad openings, exposed copper for heatsinking on Q1-Q4" },
      { name: "B.Mask", color: "#2ecc71", elements: 98, desc: "Back side pad openings" },
      { name: "Edge.Cuts", color: "#ecf0f1", elements: 4, desc: "100x45mm, rounded corners R=2mm" },
      { name: "Drill", color: "#e67e22", elements: 42, desc: "Via stitching around analog section, mounting holes" },
    ],
    firmware: `// No MCU firmware — this is an analog circuit.
// Configuration is done via hardware:
//
// Volume: ALPS EC11 rotary encoder
//   -> Controls dual-gang potentiometer (virtual via R-2R ladder)
//
// Input select: Auto-detect USB audio
//   PCM2706 handles USB Audio Class 1.0 enumeration
//   No driver required on Windows/Mac/Linux
//
// Bias adjustment (factory set):
//   R_bias (R12, R13) = 2.2K -> 20mA quiescent current
//   Measured: THD+N = 0.003% @ 1kHz, 100mW into 32 ohm
//
// If you want digital volume control, replace ALPS encoder with:
//   PGA2311 digital volume IC (SPI controlled)
//   Add ATtiny85 for encoder -> SPI bridge
//   Firmware for ATtiny85:

#include <SPI.h>
#define CS_PIN  3
#define ENC_A   1
#define ENC_B   2

volatile int volume = 192; // 0-255, 192 = 0dB

ISR(PCINT0_vect) {
  static uint8_t last = 0;
  uint8_t curr = (digitalRead(ENC_A) << 1) | digitalRead(ENC_B);
  int8_t dir = ((last << 2) | curr) & 0x0F;
  if (dir == 0b0001 || dir == 0b1110) volume = min(255, volume + 1);
  if (dir == 0b0010 || dir == 0b1101) volume = max(0, volume - 1);
  last = curr;
  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));
  digitalWrite(CS_PIN, LOW);
  SPI.transfer(volume);  // Left channel
  SPI.transfer(volume);  // Right channel
  digitalWrite(CS_PIN, HIGH);
  SPI.endTransaction();
}

void setup() {
  pinMode(CS_PIN, OUTPUT);
  SPI.begin();
  GIMSK |= (1 << PCIE);
  PCMSK |= (1 << ENC_A) | (1 << ENC_B);
}

void loop() { /* interrupt-driven */ }`,
    flashSteps: [
      { step: 1, title: "No firmware flash needed", command: "-- analog circuit --", note: "PCM2706 has built-in USB Audio Class 1.0" },
      { step: 2, title: "Connect USB-C to computer", command: "Plug in. Auto-detected as USB Audio Device.", note: "Shows as 'PCM2706 Audio' in system sound settings" },
      { step: 3, title: "Set as default output", command: "System Preferences -> Sound -> Output -> PCM2706", note: "Windows: right-click speaker icon -> Playback devices" },
      { step: 4, title: "Optional: ATtiny85 digital volume", command: "avrdude -c usbtiny -p t85 -U flash:w:volume_ctrl.hex", note: "Only if you add PGA2311 digital volume IC" },
    ],
    bom: [
      { component: "PCM2706 USB Audio Codec", qty: 1, unit: 3.50, total: 3.50, footprint: "TQFP-32" },
      { component: "PCM5102A DAC", qty: 1, unit: 2.80, total: 2.80, footprint: "TSSOP-20" },
      { component: "NE5532 Dual Opamp", qty: 2, unit: 0.40, total: 0.80, footprint: "DIP-8" },
      { component: "BD139 NPN Transistor", qty: 2, unit: 0.30, total: 0.60, footprint: "TO-126" },
      { component: "BD140 PNP Transistor", qty: 2, unit: 0.30, total: 0.60, footprint: "TO-126" },
      { component: "ALPS EC11 Encoder", qty: 1, unit: 1.20, total: 1.20, footprint: "EC11" },
      { component: "USB-C Connector", qty: 1, unit: 0.80, total: 0.80, footprint: "USB-C-16P" },
      { component: "3.5mm TRS Jack", qty: 1, unit: 0.50, total: 0.50, footprint: "PJ-320A" },
      { component: "4.4mm Pentaconn Jack", qty: 1, unit: 3.80, total: 3.80, footprint: "Pentaconn" },
      { component: "47R 1W Emitter Resistor", qty: 4, unit: 0.10, total: 0.40, footprint: "2512" },
      { component: "Film Caps + Electrolytics", qty: 20, unit: 0.15, total: 3.00, footprint: "various" },
      { component: "IRM-10-15 AC/DC PSU", qty: 1, unit: 8.00, total: 8.00, footprint: "Module" },
      { component: "4-layer PCB (100x45mm)", qty: 1, unit: 4.50, total: 4.50, footprint: "PCB" },
    ],
    enclosure: { w: 120, h: 65, d: 40, weight: "180g", material: "Aluminum 6063 (extruded)", mountHoles: 4, printSettings: { "Material": "6063 Aluminum extrusion", "Finish": "Brushed + clear anodize", "Front panel": "3mm aluminum, laser-cut", "Rear panel": "3mm aluminum, USB + IEC cutouts", "Knob": "Machined aluminum, 20mm dia, knurled", "Feet": "Silicone hemisphere, 10mm" } },
    simResults: [
      { parameter: "THD+N @ 1kHz 100mW/32ohm", value: "0.003%", status: "pass" },
      { parameter: "Output impedance", value: "0.8 ohm", status: "pass" },
      { parameter: "Channel separation", value: "98dB @ 1kHz", status: "pass" },
      { parameter: "SNR (A-weighted)", value: "108dB", status: "pass" },
      { parameter: "Power output @ 32 ohm", value: "250mW per channel", status: "pass" },
      { parameter: "Thermal (Q1/Q2 junction)", value: "68C (max 150C)", status: "pass" },
    ],
    testCases: [
      { name: "USB audio enumeration", expected: "Detected in <2s", actual: "1.1s", status: "pass" },
      { name: "Frequency response 20-20kHz", expected: "+/- 0.5dB", actual: "+/- 0.2dB", status: "pass" },
      { name: "Volume encoder steps", expected: "24 detents, monotonic", actual: "24 detents, smooth", status: "pass" },
      { name: "Balanced output wiring", expected: "Pin 1=GND, 2=L+, 3=L-, 4=R+, 5=R-", actual: "Correct", status: "pass" },
      { name: "DC offset at output", expected: "<5mV", actual: "1.2mV", status: "pass" },
    ],
    equations: [
      { name: "Quiescent current", formula: "Iq = (V+ - V_be - V_be) / (R_bias + R_emitter)", result: "(15 - 0.7 - 0.7) / (2200 + 47) = 6.04mA x2 = 20mA", unit: "mA" },
      { name: "Voltage gain", formula: "Av = 1 + (Rf / Ri)", result: "1 + (10K / 10K) = 2x (6dB)", unit: "V/V" },
      { name: "Output power @ 32 ohm", formula: "P = Vrms^2 / R_load", result: "(2.83V)^2 / 32 = 250mW", unit: "mW" },
      { name: "Power dissipation per transistor", formula: "Pd = Iq x (V+ - V_out)", result: "20mA x 12V = 240mW", unit: "mW" },
      { name: "SNR", formula: "SNR = 20 x log10(V_signal / V_noise)", result: "20 x log10(2.83 / 3.56uV) = 118dB (DAC limited to 108dB)", unit: "dB" },
    ],
    debugLog: [
      "[PWR] +15V rail: 15.02V, -15V rail: -14.98V",
      "[PWR] Virtual ground: 0.002V offset",
      "[USB] PCM2706 enumerated: 16bit/48kHz",
      "[DAC] PCM5102A lock: BCK=3.072MHz, LRCK=48kHz",
      "[AMP] Q1/Q2 bias: 19.8mA (target: 20mA)",
      "[AMP] Q3/Q4 bias: 20.1mA (target: 20mA)",
      "[AMP] DC offset L: +1.2mV, R: -0.8mV",
      "[AMP] THD+N measurement: 0.003% @ 1kHz",
      "[OUT] 3.5mm SE: connected, 32 ohm detected",
      "[OUT] 4.4mm BAL: not connected",
      "[VOL] Encoder position: 192/255 (0dB)",
    ],
  },

  remote: {
    name: "Alexa IR/BLE Remote",
    desc: "IR blaster + BLE, voice wake button, CR2032 powered, 1-year battery",
    cost: "$11.40",
    mcu: "nRF52810",
    schematicBlocks: [
      { name: "nRF52810 BLE SoC", pins: ["GPIO0-GPIO7", "SWD", "VCC", "GND"], connections: ["IR LED driver", "Button matrix", "Voice trigger", "Battery monitor"] },
      { name: "IR Transmitter", pins: ["ANODE", "CATHODE"], connections: ["TSAL6100 IR LED via N-MOSFET", "38kHz modulated from GPIO2"] },
      { name: "Button Matrix (12 keys)", pins: ["ROW0-ROW2", "COL0-COL3"], connections: ["3x4 grid, silicone dome switches", "Pull-up on rows, scan cols"] },
      { name: "Voice Trigger", pins: ["MIC+", "MIC-"], connections: ["MEMS mic (SPH0645)", "Sends BLE wake command to Echo"] },
      { name: "Power (CR2032)", pins: ["VBAT", "GND"], connections: ["3V direct to nRF52810", "No regulator needed (1.7-3.6V range)"] },
    ],
    netlist: `* Alexa Remote Netlist
.subckt MAIN
  VBAT(CR2032) -> nRF52810_VCC (no regulator)
  nRF52810_GPIO0 -> ROW0 (pull-up 100K)
  nRF52810_GPIO1 -> ROW1
  nRF52810_GPIO2 -> ROW2
  nRF52810_GPIO3-6 -> COL0-COL3 (output, scan)
  nRF52810_GPIO7 -> N-MOSFET_gate -> TSAL6100 -> R_33R -> VBAT
  nRF52810_PDM_CLK -> SPH0645_CLK
  nRF52810_PDM_DIN -> SPH0645_DOUT
.ends`,
    placementRows: [
      { ref: "U1", component: "nRF52810-QFAA", x: "16.00", y: "18.00", rotation: "0", side: "Top" },
      { ref: "D1", component: "TSAL6100 IR LED", x: "30.00", y: "3.00", rotation: "0", side: "Top" },
      { ref: "Q1", component: "2N7002 N-MOSFET", x: "26.00", y: "6.00", rotation: "0", side: "Top" },
      { ref: "MIC1", component: "SPH0645 MEMS Mic", x: "8.00", y: "3.00", rotation: "0", side: "Bottom" },
      { ref: "SW1-12", component: "Silicone dome switch", x: "grid", y: "grid", rotation: "0", side: "Top" },
      { ref: "BT1", component: "CR2032 holder", x: "16.00", y: "30.00", rotation: "0", side: "Bottom" },
      { ref: "C1-C3", component: "100nF 0402", x: "near U1", y: "decoupling", rotation: "0", side: "Top" },
    ],
    boardDims: { w: 35, h: 90, layers: 2 },
    gerberLayers: [
      { name: "F.Cu", color: "#e74c3c", elements: 52, desc: "Button pads, IR LED, MCU routing" },
      { name: "B.Cu", color: "#3498db", elements: 28, desc: "Ground plane, battery holder, MEMS mic" },
      { name: "F.SilkS", color: "#f1c40f", elements: 18, desc: "Button labels, IR window mark" },
      { name: "F.Mask", color: "#9b59b6", elements: 52, desc: "Pad openings" },
      { name: "B.Mask", color: "#2ecc71", elements: 28, desc: "Battery + mic openings" },
      { name: "Edge.Cuts", color: "#ecf0f1", elements: 4, desc: "35x90mm, rounded ends R=5mm" },
      { name: "Drill", color: "#e67e22", elements: 18, desc: "Battery tabs, mounting, antenna cutout" },
    ],
    firmware: `#include <BLEDevice.h>
#include <IRsend.h>

#define IR_PIN        7
#define MIC_CLK_PIN   8
#define MIC_DATA_PIN  9
#define ROWS          3
#define COLS          4

const int rowPins[ROWS] = {0, 1, 2};
const int colPins[COLS] = {3, 4, 5, 6};

// NEC IR codes for common TVs
const uint32_t irCodes[12] = {
  0x20DF10EF, // Power
  0x20DF40BF, // Vol+
  0x20DFC03F, // Vol-
  0x20DF00FF, // Ch+
  0x20DF807F, // Ch-
  0x20DF22DD, // Mute
  0x20DF906F, // Input
  0x20DFA25D, // Menu
  0x20DF02FD, // OK/Enter
  0x20DFE01F, // Up
  0x20DF609F, // Down
  0x20DF827D, // Back
};

IRsend irsend(IR_PIN);
BLEClient* pClient;

void setup() {
  for (int r = 0; r < ROWS; r++) {
    pinMode(rowPins[r], INPUT_PULLUP);
  }
  for (int c = 0; c < COLS; c++) {
    pinMode(colPins[c], OUTPUT);
    digitalWrite(colPins[c], HIGH);
  }
  irsend.begin();
  BLEDevice::init("Bleuprint Remote");

  // Enter low-power mode between scans
  // Wake on GPIO interrupt from any row going LOW
}

int scanKeys() {
  for (int c = 0; c < COLS; c++) {
    digitalWrite(colPins[c], LOW);
    for (int r = 0; r < ROWS; r++) {
      if (digitalRead(rowPins[r]) == LOW) {
        digitalWrite(colPins[c], HIGH);
        return r * COLS + c;
      }
    }
    digitalWrite(colPins[c], HIGH);
  }
  return -1;
}

void loop() {
  int key = scanKeys();
  if (key >= 0 && key < 12) {
    irsend.sendNEC(irCodes[key], 32);
    delay(200); // debounce
  }
  // Deep sleep between presses: ~0.4uA
  // Wake on GPIO interrupt
}`,
    flashSteps: [
      { step: 1, title: "Install nRF Connect SDK", command: "Download nRF Connect for Desktop + Programmer", note: "Requires J-Link or DAPLink probe ($15 clone works)" },
      { step: 2, title: "Wire SWD debug pads", command: "Connect SWDIO, SWDCLK, GND, VCC (4 wires)", note: "Use pogo pin jig for production. Solder wires for prototype." },
      { step: 3, title: "Flash SoftDevice", command: "nrfjprog --program s112_nrf52_7.3.0_softdevice.hex --sectorerase", note: "S112 (BLE peripheral only) — smallest footprint" },
      { step: 4, title: "Flash application", command: "nrfjprog --program bleuprint_remote.hex --sectorerase --verify", note: "~18KB. Fits with S112 in 192KB flash." },
      { step: 5, title: "Pair with Alexa", command: "Alexa app -> Devices -> Add -> Remote", note: "Appears as 'Bleuprint Remote'. Pair once, reconnects automatically." },
      { step: 6, title: "Verify IR output", command: "Point at phone camera, press any button", note: "You should see purple flash from IR LED through camera" },
    ],
    bom: [
      { component: "nRF52810-QFAA BLE SoC", qty: 1, unit: 1.80, total: 1.80, footprint: "QFN-32" },
      { component: "TSAL6100 IR LED", qty: 1, unit: 0.20, total: 0.20, footprint: "5mm TH" },
      { component: "2N7002 N-MOSFET", qty: 1, unit: 0.05, total: 0.05, footprint: "SOT-23" },
      { component: "SPH0645 MEMS Mic", qty: 1, unit: 1.50, total: 1.50, footprint: "LGA" },
      { component: "Silicone dome switches", qty: 12, unit: 0.08, total: 0.96, footprint: "Dome 6mm" },
      { component: "CR2032 Holder", qty: 1, unit: 0.30, total: 0.30, footprint: "TH" },
      { component: "CR2032 Battery", qty: 1, unit: 0.40, total: 0.40, footprint: "CR2032" },
      { component: "100nF 0402 Caps", qty: 3, unit: 0.005, total: 0.02, footprint: "0402" },
      { component: "33R 0402 Resistor", qty: 1, unit: 0.005, total: 0.01, footprint: "0402" },
      { component: "2-layer PCB (35x90mm)", qty: 1, unit: 1.50, total: 1.50, footprint: "PCB" },
    ],
    enclosure: { w: 40, h: 95, d: 14, weight: "32g", material: "ABS (injection molded)", mountHoles: 0, printSettings: { "Method": "3D print (prototype) / injection mold (production)", "Material": "ABS, matte white", "Wall thickness": "1.5mm", "IR window": "Clear polycarbonate insert", "Battery door": "Snap-fit, coin slot opening", "Buttons": "Silicone overmold keypad" } },
    simResults: [
      { parameter: "BLE TX power consumption", value: "4.6mA @ 0dBm (30ms burst)", status: "pass" },
      { parameter: "Sleep current", value: "0.4uA (GPIO wake)", status: "pass" },
      { parameter: "IR range (TSAL6100)", value: "12m @ 38kHz into TSOP4838", status: "pass" },
      { parameter: "Battery life (10 presses/day)", value: "14 months", status: "pass" },
      { parameter: "BLE connection latency", value: "18ms (spec: <30ms)", status: "pass" },
      { parameter: "Button debounce", value: "Clean after 8ms settle", status: "pass" },
    ],
    testCases: [
      { name: "All 12 buttons register", expected: "12 unique codes", actual: "12 unique codes", status: "pass" },
      { name: "IR reaches 10m", expected: "Reliable @ 10m", actual: "Reliable @ 12m", status: "pass" },
      { name: "BLE pair with Echo", expected: "Pair in <5s", actual: "3.2s", status: "pass" },
      { name: "Voice trigger wakes Alexa", expected: "Wake in <500ms", actual: "~320ms", status: "pass" },
      { name: "Battery life simulation", expected: ">12 months", actual: "14.2 months calc", status: "pass" },
    ],
    equations: [
      { name: "Battery life", formula: "T = C / (I_sleep + I_active x duty)", result: "220mAh / (0.4uA + 4.6mA x 0.00035) = 14.2 months", unit: "months" },
      { name: "IR LED current", formula: "I = (Vbat - Vf_ir) / R_series", result: "(3.0 - 1.2) / 33 = 54mA pulse", unit: "mA" },
      { name: "IR carrier frequency", formula: "f = 1 / (2 x t_half)", result: "1 / (2 x 13.16us) = 38.0kHz", unit: "kHz" },
      { name: "NEC bit time", formula: "t_bit = 562.5us mark + 562.5us/1687.5us space", result: "1.125ms (0) or 2.25ms (1)", unit: "ms" },
    ],
    debugLog: [
      "[00:00.000] nRF52810 boot: 64MHz, flash 192KB, RAM 24KB",
      "[00:00.002] SoftDevice S112 v7.3.0 active",
      "[00:00.004] GPIO: 3 rows (input, pull-up), 4 cols (output)",
      "[00:00.005] IR: GPIO7 -> MOSFET -> TSAL6100, 38kHz carrier",
      "[00:00.006] BLE: advertising 'Bleuprint Remote'",
      "[00:00.008] PDM: MEMS mic configured, CLK=1.032MHz",
      "[00:00.010] Entering system OFF mode (0.4uA)",
      "",
      "--- Button press event ---",
      "[00:12.000] Wake: GPIO interrupt ROW0",
      "[00:12.001] Scan: COL2 x ROW0 = KEY_5 (Mute)",
      "[00:12.002] IR TX: NEC 0x20DF22DD (32 bits, 67.5ms)",
      "[00:12.003] BLE TX: HID keycode 0xE2 (Mute)",
      "[00:12.070] Returning to system OFF",
    ],
  },

  voice: {
    name: "Voice Assistant Device",
    desc: "ESP32-S3 with MEMS mic array, 3W speaker, WiFi, wake word detection, OLED status display",
    cost: "$28.50",
    mcu: "ESP32-S3-WROOM-1",
    schematicBlocks: [
      { name: "ESP32-S3 Main SoC", pins: ["GPIO0-GPIO45", "USB", "PSRAM", "3V3"], connections: ["I2S mic input", "I2S speaker output", "I2C OLED", "WiFi antenna", "Button + LED"] },
      { name: "Microphone Array (2x INMP441)", pins: ["WS", "SCK", "SD", "L/R"], connections: ["I2S0 bus from ESP32-S3", "Left mic: L/R=GND, Right mic: L/R=VCC", "Beamforming in software"] },
      { name: "Audio Output (MAX98357A)", pins: ["BCLK", "LRCLK", "DIN", "GAIN", "SD_MODE"], connections: ["I2S1 bus from ESP32-S3", "3W 4-ohm speaker", "Gain: 9dB (GAIN=VCC)"] },
      { name: "OLED Display (SSD1306)", pins: ["SDA", "SCL", "VCC", "GND"], connections: ["I2C @ 400kHz", "0.96in 128x64 white OLED"] },
      { name: "Power", pins: ["5V_USB", "3V3", "GND"], connections: ["USB-C input", "AMS1117-3.3 for ESP32", "5V direct to MAX98357A"] },
    ],
    netlist: `* Voice Assistant Netlist
.subckt MIC_ARRAY
  ESP32_I2S0_WS -> INMP441_L_WS, INMP441_R_WS
  ESP32_I2S0_SCK -> INMP441_L_SCK, INMP441_R_SCK
  INMP441_L_SD -> ESP32_I2S0_DIN (L/R=GND selects left slot)
  INMP441_R_SD -> ESP32_I2S0_DIN (L/R=VCC selects right slot)
.ends

.subckt SPEAKER
  ESP32_I2S1_BCLK -> MAX98357A_BCLK
  ESP32_I2S1_LRCLK -> MAX98357A_LRCLK
  ESP32_I2S1_DOUT -> MAX98357A_DIN
  MAX98357A_OUT+ -> SPK+ (3W 4ohm)
  MAX98357A_OUT- -> SPK-
.ends`,
    placementRows: [
      { ref: "U1", component: "ESP32-S3-WROOM-1", x: "25.00", y: "20.00", rotation: "0", side: "Top" },
      { ref: "U2", component: "INMP441 (Left)", x: "8.00", y: "5.00", rotation: "0", side: "Bottom" },
      { ref: "U3", component: "INMP441 (Right)", x: "42.00", y: "5.00", rotation: "0", side: "Bottom" },
      { ref: "U4", component: "MAX98357A", x: "25.00", y: "38.00", rotation: "0", side: "Top" },
      { ref: "U5", component: "AMS1117-3.3", x: "8.00", y: "38.00", rotation: "0", side: "Top" },
      { ref: "D1", component: "SSD1306 0.96in OLED", x: "25.00", y: "8.00", rotation: "0", side: "Top" },
      { ref: "J1", component: "USB-C Connector", x: "5.00", y: "22.00", rotation: "270", side: "Top" },
      { ref: "SPK1", component: "Speaker 3W 4ohm", x: "25.00", y: "45.00", rotation: "0", side: "Bottom" },
    ],
    boardDims: { w: 55, h: 55, layers: 4 },
    gerberLayers: [
      { name: "F.Cu (Signal)", color: "#e74c3c", elements: 112, desc: "I2S routing, I2C bus, USB, antenna keep-out" },
      { name: "In1.Cu (GND)", color: "#27ae60", elements: 8, desc: "Solid ground plane, critical for mic noise floor" },
      { name: "In2.Cu (Power)", color: "#e67e22", elements: 10, desc: "3.3V and 5V split planes" },
      { name: "B.Cu (Signal)", color: "#3498db", elements: 76, desc: "Mic pads, speaker traces, via fanout" },
      { name: "F.SilkS", color: "#f1c40f", elements: 24, desc: "Component labels, mic hole markers" },
      { name: "F.Mask", color: "#9b59b6", elements: 112, desc: "Pad openings, OLED window" },
      { name: "B.Mask", color: "#2ecc71", elements: 76, desc: "Mic port openings (acoustic)" },
      { name: "Edge.Cuts", color: "#ecf0f1", elements: 4, desc: "55x55mm square, R=3mm corners" },
      { name: "Drill", color: "#e67e22", elements: 38, desc: "Mic sound ports, mounting, via stitching" },
    ],
    firmware: `#include <WiFi.h>
#include <driver/i2s.h>
#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <HTTPClient.h>

// Pin definitions
#define I2S_MIC_WS    15
#define I2S_MIC_SCK   14
#define I2S_MIC_SD    32
#define I2S_SPK_BCLK  26
#define I2S_SPK_LRCLK 25
#define I2S_SPK_DIN   22
#define OLED_SDA      21
#define OLED_SCL      19
#define BUTTON_PIN    0
#define LED_PIN       2

Adafruit_SSD1306 display(128, 64, &Wire);
const char* ssid = "YOUR_WIFI";
const char* pass = "********";
const char* tts_endpoint = "https://api.bleuprint.io/voice";

// Wake word detection (simple energy-based)
#define SAMPLE_RATE   16000
#define BUFFER_SIZE   512
#define WAKE_THRESHOLD 8000
int16_t audioBuffer[BUFFER_SIZE];
bool listening = false;

void setupMicI2S() {
  i2s_config_t cfg = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = BUFFER_SIZE,
  };
  i2s_pin_config_t pins = {
    .bck_io_num = I2S_MIC_SCK,
    .ws_io_num = I2S_MIC_WS,
    .data_out_num = I2S_PIN_NO_CHANGE,
    .data_in_num = I2S_MIC_SD,
  };
  i2s_driver_install(I2S_NUM_0, &cfg, 0, NULL);
  i2s_set_pin(I2S_NUM_0, &pins);
}

void setupSpeakerI2S() {
  i2s_config_t cfg = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_TX),
    .sample_rate = SAMPLE_RATE,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_16BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_STAND_I2S,
    .dma_buf_count = 4,
    .dma_buf_len = BUFFER_SIZE,
  };
  i2s_pin_config_t pins = {
    .bck_io_num = I2S_SPK_BCLK,
    .ws_io_num = I2S_SPK_LRCLK,
    .data_out_num = I2S_SPK_DIN,
    .data_in_num = I2S_PIN_NO_CHANGE,
  };
  i2s_driver_install(I2S_NUM_1, &cfg, 0, NULL);
  i2s_set_pin(I2S_NUM_1, &pins);
}

float computeEnergy() {
  size_t bytesRead;
  i2s_read(I2S_NUM_0, audioBuffer, sizeof(audioBuffer), &bytesRead, 100);
  float energy = 0;
  int samples = bytesRead / 2;
  for (int i = 0; i < samples; i++) {
    energy += abs(audioBuffer[i]);
  }
  return energy / samples;
}

void updateDisplay(const char* status, const char* line2) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("BLEUPRINT VOICE");
  display.drawLine(0, 10, 128, 10, WHITE);
  display.setCursor(0, 16);
  display.setTextSize(2);
  display.println(status);
  display.setTextSize(1);
  display.setCursor(0, 40);
  display.println(line2);
  display.display();
}

void setup() {
  Serial.begin(115200);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Wire.begin(OLED_SDA, OLED_SCL);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  updateDisplay("INIT", "Connecting WiFi...");
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  setupMicI2S();
  setupSpeakerI2S();
  updateDisplay("READY", WiFi.localIP().toString().c_str());
}

void loop() {
  float energy = computeEnergy();

  if (!listening && (energy > WAKE_THRESHOLD || digitalRead(BUTTON_PIN) == LOW)) {
    listening = true;
    digitalWrite(LED_PIN, HIGH);
    updateDisplay("LISTEN", "Speak now...");
    // Record 3 seconds of audio and send to API
    // ... (audio capture + HTTP POST)
    delay(3000);
    updateDisplay("THINK", "Processing...");
    delay(1000);
    updateDisplay("SPEAK", "Playing response");
    // Play TTS response via I2S speaker
    delay(2000);
    listening = false;
    digitalWrite(LED_PIN, LOW);
    updateDisplay("READY", "Say wake word...");
  }
  delay(10);
}`,
    flashSteps: [
      { step: 1, title: "Install ESP-IDF v5.x", command: "mkdir -p ~/esp && cd ~/esp\ngit clone --recursive https://github.com/espressif/esp-idf.git\n./install.sh esp32s3", note: "Or use Arduino IDE with ESP32 board package v2.0.14+" },
      { step: 2, title: "Set target", command: ". ~/esp/esp-idf/export.sh\nidf.py set-target esp32s3", note: "ESP32-S3 has native USB and vector extensions for audio" },
      { step: 3, title: "Configure PSRAM", command: "idf.py menuconfig -> Component config -> ESP PSRAM -> Enable PSRAM", note: "8MB PSRAM needed for audio buffers" },
      { step: 4, title: "Build", command: "idf.py build", note: "First build ~3 min. Firmware size ~1.2MB" },
      { step: 5, title: "Flash via USB-C", command: "idf.py -p /dev/ttyACM0 flash", note: "ESP32-S3 native USB — no external UART needed" },
      { step: 6, title: "Monitor output", command: "idf.py -p /dev/ttyACM0 monitor", note: "Should see WiFi connect + 'READY' on OLED" },
      { step: 7, title: "Test wake word", command: "Speak loudly near device or press button", note: "LED lights up, OLED shows 'LISTEN'" },
    ],
    bom: [
      { component: "ESP32-S3-WROOM-1 (8MB PSRAM)", qty: 1, unit: 3.20, total: 3.20, footprint: "Module" },
      { component: "INMP441 MEMS Mic", qty: 2, unit: 1.60, total: 3.20, footprint: "LGA" },
      { component: "MAX98357A I2S Amp", qty: 1, unit: 1.80, total: 1.80, footprint: "QFN-16" },
      { component: "3W 4ohm Speaker 40mm", qty: 1, unit: 1.50, total: 1.50, footprint: "40mm round" },
      { component: "SSD1306 0.96in OLED", qty: 1, unit: 2.80, total: 2.80, footprint: "FPC-4P" },
      { component: "AMS1117-3.3 LDO", qty: 1, unit: 0.15, total: 0.15, footprint: "SOT-223" },
      { component: "USB-C Connector", qty: 1, unit: 0.80, total: 0.80, footprint: "USB-C-16P" },
      { component: "Tactile Button", qty: 1, unit: 0.05, total: 0.05, footprint: "6x6mm" },
      { component: "LED (Blue)", qty: 1, unit: 0.03, total: 0.03, footprint: "0603" },
      { component: "Passives (R/C)", qty: 15, unit: 0.01, total: 0.15, footprint: "0402" },
      { component: "4-layer PCB (55x55mm)", qty: 1, unit: 3.50, total: 3.50, footprint: "PCB" },
    ],
    enclosure: { w: 65, h: 65, d: 45, weight: "85g", material: "PLA + fabric mesh", mountHoles: 4, printSettings: { "Body": "PLA, matte black", "Top grille": "Fabric mesh (acoustically transparent)", "OLED window": "Clear PETG inset", "Layer height": "0.2mm", "Infill": "15% gyroid", "Speaker port": "Bottom-firing, angled baffle" } },
    simResults: [
      { parameter: "Mic SNR (single INMP441)", value: "65dB A-weighted", status: "pass" },
      { parameter: "Beamforming gain (2-mic)", value: "+6dB directional, -12dB ambient", status: "pass" },
      { parameter: "Speaker SPL @ 1m", value: "78dB (3W max)", status: "pass" },
      { parameter: "WiFi round-trip (voice API)", value: "320ms avg (LAN), 580ms (cloud)", status: "pass" },
      { parameter: "Wake word false positive rate", value: "2.1/day (energy-based)", status: "warn" },
      { parameter: "Power draw (idle, WiFi connected)", value: "80mA @ 5V = 0.4W", status: "pass" },
    ],
    testCases: [
      { name: "Wake word detection @ 2m", expected: "Detect in <500ms", actual: "380ms", status: "pass" },
      { name: "Audio recording quality", expected: "16kHz 16-bit clean", actual: "SNR 58dB (room)", status: "pass" },
      { name: "Speaker playback clarity", expected: "Intelligible speech", actual: "Clear at 70% volume", status: "pass" },
      { name: "WiFi reconnect after drop", expected: "<5s", actual: "2.8s", status: "pass" },
      { name: "OLED status accuracy", expected: "Reflects all states", actual: "All 4 states shown", status: "pass" },
      { name: "Button override works", expected: "Immediate listen", actual: "Immediate", status: "pass" },
    ],
    equations: [
      { name: "Sampling theorem", formula: "f_sample >= 2 x f_max", result: "16kHz >= 2 x 8kHz (human speech)", unit: "kHz" },
      { name: "I2S bit clock", formula: "BCLK = f_sample x bits x channels", result: "16000 x 16 x 2 = 512kHz", unit: "kHz" },
      { name: "Speaker power", formula: "P = V_rms^2 / R_load", result: "(3.3V_pp / 2sqrt2)^2 / 4 = 0.68W RMS", unit: "W" },
      { name: "Mic sensitivity", formula: "dBFS = 20 x log10(V / V_ref)", result: "-26 dBFS @ 94dB SPL (1 Pa)", unit: "dBFS" },
      { name: "Beamforming delay", formula: "d = spacing x sin(theta) / c_sound", result: "40mm x sin(30) / 343 = 58.3us", unit: "us" },
    ],
    debugLog: [
      "[00:00.000] ESP32-S3 boot: 240MHz, PSRAM 8MB, flash 8MB",
      "[00:00.010] I2C: SSD1306 OLED @ 0x3C -- OK",
      "[00:00.015] I2S0: INMP441 x2 configured, 16kHz stereo",
      "[00:00.020] I2S1: MAX98357A configured, 16kHz mono",
      "[00:00.025] WiFi: connecting to YOUR_WIFI...",
      "[00:01.200] WiFi: connected, IP 192.168.1.42, RSSI -38dBm",
      "[00:01.210] OLED: displaying 'READY'",
      "[00:01.220] Audio: background energy monitoring started",
      "[00:01.230] Idle power: 78mA @ 5V",
      "",
      "--- Wake event ---",
      "[00:15.000] Wake: energy 12400 > threshold 8000",
      "[00:15.001] LED ON, OLED: 'LISTEN'",
      "[00:15.002] Recording: 3s @ 16kHz = 96KB",
      "[00:18.002] HTTP POST /voice: 96KB payload",
      "[00:18.580] Response: 200 OK, TTS audio 2.4s",
      "[00:18.590] OLED: 'SPEAK', playing response",
      "[00:21.000] Playback complete, returning to READY",
    ],
  },

  cloud: {
    name: "Personal ARM Cloud Server",
    desc: "4x CM4 compute cluster, shared NVMe NAS, Gigabit switch, Docker + K3s ready",
    cost: "$340.00",
    mcu: "Raspberry Pi CM4 (4x)",
    schematicBlocks: [
      { name: "Backplane PCB", pins: ["PCIe x1 (x4)", "Gigabit ETH (x4)", "USB-C PD (x4)", "Shared NVMe M.2"], connections: ["CM4 connectors (2x 100-pin hirose)", "RTL8367S managed switch IC", "Power distribution from 12V barrel"] },
      { name: "Compute Node (CM4 x4)", pins: ["2x100-pin connector", "ETH", "USB 2.0", "PCIe x1"], connections: ["8GB RAM per node", "32GB eMMC per node", "Gigabit to backplane switch"] },
      { name: "Network Switch (RTL8367S)", pins: ["Port0-Port4", "MDIO/MDC", "LED"], connections: ["4 CM4 ports + 1 uplink", "Auto-MDIX, 802.3az EEE"] },
      { name: "NVMe Storage", pins: ["M.2 M-key", "PCIe x1"], connections: ["Shared via CM4 node 0 (NFS server)", "Up to 2TB NVMe SSD"] },
      { name: "Power Distribution", pins: ["12V barrel", "5V rails (x4)"], connections: ["4x TPS54560 5V/3A buck converters", "Total: 60W max system power"] },
    ],
    netlist: `* Personal Cloud Netlist
.subckt BACKPLANE
  12V_IN -> TPS54560_1 -> 5V_NODE0 (3A max)
  12V_IN -> TPS54560_2 -> 5V_NODE1
  12V_IN -> TPS54560_3 -> 5V_NODE2
  12V_IN -> TPS54560_4 -> 5V_NODE3

  CM4_0_ETH -> RTL8367S_P0
  CM4_1_ETH -> RTL8367S_P1
  CM4_2_ETH -> RTL8367S_P2
  CM4_3_ETH -> RTL8367S_P3
  RTL8367S_P4 -> RJ45_UPLINK

  CM4_0_PCIe -> M.2_NVMe_slot
.ends`,
    placementRows: [
      { ref: "J1-J4", component: "CM4 Connector (2x100P)", x: "grid 50mm", y: "center", rotation: "0", side: "Top" },
      { ref: "U1", component: "RTL8367S Switch IC", x: "110.00", y: "40.00", rotation: "0", side: "Bottom" },
      { ref: "U2-U5", component: "TPS54560 Buck Conv", x: "per node", y: "near CM4", rotation: "0", side: "Bottom" },
      { ref: "J5", component: "M.2 M-key NVMe", x: "20.00", y: "70.00", rotation: "0", side: "Bottom" },
      { ref: "J6", component: "RJ45 w/ magnetics", x: "120.00", y: "70.00", rotation: "0", side: "Top" },
      { ref: "J7", component: "12V DC Barrel Jack", x: "5.00", y: "40.00", rotation: "270", side: "Top" },
      { ref: "LED1-4", component: "Status LED (per node)", x: "per node", y: "edge", rotation: "0", side: "Top" },
    ],
    boardDims: { w: 130, h: 80, layers: 6 },
    gerberLayers: [
      { name: "F.Cu (Signal)", color: "#e74c3c", elements: 420, desc: "CM4 high-speed traces, ETH diff pairs" },
      { name: "In1.Cu (GND)", color: "#27ae60", elements: 8, desc: "Solid ground reference, impedance control" },
      { name: "In2.Cu (Power)", color: "#e67e22", elements: 24, desc: "12V input, 5V per-node power islands" },
      { name: "In3.Cu (GND)", color: "#27ae60", elements: 8, desc: "Second ground plane for PCIe shielding" },
      { name: "In4.Cu (Signal)", color: "#ff9800", elements: 180, desc: "PCIe lanes, MDIO bus" },
      { name: "B.Cu (Signal)", color: "#3498db", elements: 310, desc: "NVMe traces, buck converter routing" },
      { name: "F.SilkS", color: "#f1c40f", elements: 52, desc: "Node numbers, orientation, test points" },
      { name: "F.Mask", color: "#9b59b6", elements: 420, desc: "CM4 connector pads, RJ45, barrel jack" },
      { name: "B.Mask", color: "#2ecc71", elements: 310, desc: "Switch IC, buck converters, NVMe" },
      { name: "Edge.Cuts", color: "#ecf0f1", elements: 4, desc: "130x80mm, mounting ears at corners" },
      { name: "Drill", color: "#e67e22", elements: 280, desc: "CM4 connector (800 pins), via stitching, mounting" },
    ],
    firmware: `#!/bin/bash
# K3s Cluster Bootstrap Script
# Run on node 0 (master) first, then workers

set -e

NODE_IP=$(hostname -I | awk '{print $1}')
CLUSTER_TOKEN="bleuprint-cloud-$(openssl rand -hex 16)"

echo "=== Bleuprint Personal Cloud Setup ==="
echo "Node IP: $NODE_IP"

# --- Node 0: Master + NFS Server ---
if [ "$(hostname)" = "node0" ]; then
  echo "[1/6] Formatting NVMe..."
  sudo mkfs.ext4 -L cloudstore /dev/nvme0n1
  sudo mkdir -p /mnt/storage
  sudo mount /dev/nvme0n1 /mnt/storage
  echo "/dev/nvme0n1 /mnt/storage ext4 defaults 0 2" | sudo tee -a /etc/fstab

  echo "[2/6] Starting NFS server..."
  sudo apt install -y nfs-kernel-server
  echo "/mnt/storage 10.0.0.0/24(rw,sync,no_root_squash)" | sudo tee -a /etc/exports
  sudo systemctl enable --now nfs-server

  echo "[3/6] Installing K3s master..."
  curl -sfL https://get.k3s.io | K3S_TOKEN="$CLUSTER_TOKEN" sh -

  echo "[4/6] Waiting for K3s to be ready..."
  sleep 10
  sudo kubectl get nodes

  echo "[5/6] Deploying monitoring stack..."
  sudo kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/kube-prometheus/main/manifests/setup/

  echo "[6/6] Master setup complete."
  echo "Join token: $CLUSTER_TOKEN"
  echo "Master URL: https://$NODE_IP:6443"

# --- Workers: Join cluster ---
else
  MASTER_IP="10.0.0.1"  # Node 0 IP
  echo "[1/3] Mounting shared NFS storage..."
  sudo apt install -y nfs-common
  sudo mkdir -p /mnt/storage
  sudo mount $MASTER_IP:/mnt/storage /mnt/storage

  echo "[2/3] Joining K3s cluster..."
  curl -sfL https://get.k3s.io | K3S_URL="https://$MASTER_IP:6443" K3S_TOKEN="$CLUSTER_TOKEN" sh -

  echo "[3/3] Worker setup complete. Joined cluster."
fi

echo "=== Bleuprint Cloud Ready ==="
echo "Dashboard: http://$NODE_IP:3000"
echo "Storage: /mnt/storage ($(df -h /mnt/storage | tail -1 | awk '{print $2}') total)"`,
    flashSteps: [
      { step: 1, title: "Flash CM4 eMMC (per node)", command: "sudo rpiboot   # puts CM4 in USB mass storage mode\nsudo rpi-imager  # flash Raspberry Pi OS Lite 64-bit", note: "Repeat for all 4 CM4 modules. Use USB-C on backplane." },
      { step: 2, title: "Enable SSH + set hostname", command: "touch /boot/ssh\necho 'node0' > /boot/hostname   # node0, node1, node2, node3", note: "Set static IPs: 10.0.0.1 - 10.0.0.4 in /boot/cmdline.txt" },
      { step: 3, title: "Boot all nodes", command: "Insert CM4 modules into backplane, apply 12V power", note: "Status LEDs: green=booted, red=error. All 4 should be green in ~30s." },
      { step: 4, title: "SSH into node0", command: "ssh pi@10.0.0.1", note: "Default password: raspberry. Change immediately." },
      { step: 5, title: "Run bootstrap script", command: "curl -sL https://bleuprint.io/cloud-setup.sh | sudo bash", note: "Sets up NFS, K3s master, monitoring. ~5 min." },
      { step: 6, title: "Join workers", command: "for i in 1 2 3; do ssh pi@10.0.0.$((i+1)) 'curl -sL ... | sudo bash'; done", note: "Each worker takes ~2 min to join cluster." },
      { step: 7, title: "Verify cluster", command: "kubectl get nodes -o wide", note: "Should show 4 nodes: Ready, ARM64, K3s v1.28+" },
    ],
    bom: [
      { component: "Raspberry Pi CM4 8GB/32GB", qty: 4, unit: 65.00, total: 260.00, footprint: "CM4-module" },
      { component: "CM4 IO Board Connector", qty: 4, unit: 2.50, total: 10.00, footprint: "2x100P Hirose" },
      { component: "RTL8367S Managed Switch", qty: 1, unit: 4.80, total: 4.80, footprint: "QFN-64" },
      { component: "TPS54560 5V/3A Buck", qty: 4, unit: 1.20, total: 4.80, footprint: "HTSSOP-8" },
      { component: "RJ45 w/ Magnetics", qty: 1, unit: 2.50, total: 2.50, footprint: "RJ45-MAG" },
      { component: "M.2 M-key Connector", qty: 1, unit: 1.50, total: 1.50, footprint: "M.2-2280" },
      { component: "12V DC Barrel Jack", qty: 1, unit: 0.40, total: 0.40, footprint: "DC-005" },
      { component: "Status LEDs", qty: 4, unit: 0.03, total: 0.12, footprint: "0603" },
      { component: "Inductors + Caps (buck)", qty: 20, unit: 0.25, total: 5.00, footprint: "various" },
      { component: "6-layer PCB (130x80mm)", qty: 1, unit: 12.00, total: 12.00, footprint: "PCB" },
    ],
    enclosure: { w: 150, h: 100, d: 50, weight: "450g", material: "Aluminum + acrylic side panel", mountHoles: 4, printSettings: { "Frame": "2mm aluminum sheet, bent", "Side panel": "3mm smoked acrylic (see internals)", "Fan mount": "40mm intake, 40mm exhaust", "Cooling": "Passive heatsinks on CM4 + active fan", "Rack mount": "Optional 1U rack ears", "Cable routing": "Rear panel: RJ45, USB-C, DC barrel" } },
    simResults: [
      { parameter: "Gigabit ETH throughput (iperf3)", value: "941 Mbps per node", status: "pass" },
      { parameter: "NVMe sequential read", value: "1,850 MB/s via PCIe x1", status: "pass" },
      { parameter: "Power draw (idle, 4 nodes)", value: "18W total", status: "pass" },
      { parameter: "Power draw (full load)", value: "52W total", status: "pass" },
      { parameter: "Thermal (CM4 under stress)", value: "68C with heatsink + fan", status: "pass" },
      { parameter: "K3s pod scheduling latency", value: "120ms avg", status: "pass" },
    ],
    testCases: [
      { name: "All 4 nodes boot and join cluster", expected: "4 Ready nodes", actual: "4 Ready in 45s", status: "pass" },
      { name: "NFS share accessible from all nodes", expected: "R/W from all", actual: "R/W confirmed", status: "pass" },
      { name: "Deploy nginx across cluster", expected: "4 replicas running", actual: "4/4 running", status: "pass" },
      { name: "Node failure recovery", expected: "Pods reschedule in <60s", actual: "Rescheduled in 32s", status: "pass" },
      { name: "Network isolation between pods", expected: "Flannel CNI enforced", actual: "Verified", status: "pass" },
      { name: "12V power stability under load", expected: "Ripple <100mV", actual: "42mV pp", status: "pass" },
    ],
    equations: [
      { name: "Total compute (4 nodes)", formula: "4 x (4-core A72 @ 1.5GHz)", result: "16 cores, ~24 GFLOPS FP32", unit: "GFLOPS" },
      { name: "Total RAM", formula: "4 x 8GB LPDDR4", result: "32GB total cluster RAM", unit: "GB" },
      { name: "Storage throughput", formula: "PCIe x1 Gen 2 = 5 GT/s x 8/10 encoding", result: "~500 MB/s usable (SSD limited)", unit: "MB/s" },
      { name: "Power per node", formula: "P = V x I = 5V x 2.5A (avg)", result: "12.5W per node, 50W cluster", unit: "W" },
      { name: "Network bandwidth", formula: "4 x 1Gbps half-duplex to switch", result: "4 Gbps aggregate backplane", unit: "Gbps" },
    ],
    debugLog: [
      "[POWER] 12V input: 12.04V, total draw: 18.2W (idle)",
      "[POWER] Node 0: 5.02V / 1.1A | Node 1: 5.01V / 0.9A",
      "[POWER] Node 2: 5.02V / 1.0A | Node 3: 5.01V / 0.8A",
      "[NET] RTL8367S switch: 5 ports up, auto-MDIX",
      "[NET] Port 0 (node0): 1000M/Full, TX: 124MB, RX: 89MB",
      "[NET] Port 4 (uplink): 1000M/Full, TX: 213MB, RX: 156MB",
      "[BOOT] node0: Linux 6.1.0-rpi, CM4 rev 1.4, 8GB RAM",
      "[BOOT] node1: up, joined cluster",
      "[BOOT] node2: up, joined cluster",
      "[BOOT] node3: up, joined cluster",
      "[K3S] Master: v1.28.4+k3s1",
      "[K3S] Nodes: 4/4 Ready",
      "[K3S] Pods: 12 running, 0 pending",
      "[NFS] /mnt/storage: 1.8TB avail, 23GB used",
      "[TEMP] node0: 52C | node1: 48C | node2: 50C | node3: 47C",
    ],
  },
};

/* ═══════════════════════════════════════
   CHAT RESPONSES PER TAB
   ═══════════════════════════════════════ */

type ChatTabKey = "schematic" | "placement" | "gerber" | "viewer" | "simulation" | "testing" | "math" | "code" | "flash" | "debug";

const chatResponses: Record<ChatTabKey, string[]> = {
  schematic: [
    "The schematic follows a hierarchical block approach. Each functional block has clear boundaries with defined interfaces between them.",
    "Power decoupling follows best practices: 100nF ceramic at each IC pin, bulk electrolytics at board-level power entry.",
    "All signal-level connections are annotated with net names. The netlist can be exported to KiCad, Altium, or Eagle formats.",
  ],
  placement: [
    "Component placement prioritizes signal integrity. High-speed traces routed first, then power, then low-speed signals.",
    "Thermal considerations: power components near board edge for convection. Ground plane provides heat spreading under MCU.",
    "All SMD components on one side for single-pass reflow. Through-hole connectors on opposite side.",
  ],
  gerber: [
    "Gerber files follow IPC-2581 naming convention. All layers verified with DRC at 6mil min trace/space.",
    "Board outline includes fiducials at 3 corners for pick-and-place alignment. Panelization V-score marks included.",
    "Manufacturing notes embedded in fabrication layer: stackup, finish, impedance requirements.",
  ],
  viewer: [
    "3D model generated from PCB dimensions + component heights. Enclosure designed with 1mm clearance on all sides.",
    "Mounting holes align with PCB. Boss height accounts for component clearance on bottom side.",
    "Model exported as STEP for mechanical integration and STL for 3D printing. Wall thickness verified for printability.",
  ],
  simulation: [
    "All electrical simulations run with typical + worst-case component tolerances (5% resistor, 20% capacitor).",
    "Thermal simulation assumes 25C ambient, natural convection. Forced air with 40mm fan reduces junction temps by ~15C.",
    "Signal integrity checks pass for all high-speed interfaces. Impedance-controlled traces matched to 50/100 ohm.",
  ],
  testing: [
    "Test suite covers functional, environmental, and stress testing. Each test has explicit pass/fail criteria.",
    "Production test jig designed for pogo-pin bed-of-nails contact. Test cycle time: 8 seconds per board.",
    "Results logged to CSV with serial number, timestamp, and per-test measurements for traceability.",
  ],
  math: [
    "All equations use SI units. Results verified against simulation for consistency within 5% tolerance.",
    "Power budget accounts for peak and average consumption. Derating applied per manufacturer guidelines.",
    "Thermal calculations assume worst-case ambient (40C industrial) unless otherwise noted.",
  ],
  code: [
    "Firmware follows embedded best practices: no dynamic allocation, bounded loops, watchdog timer enabled.",
    "All GPIO assignments match the schematic. Pin remapping documented in header file.",
    "Code compiles without warnings on GCC -Wall -Wextra. Stack usage verified to fit in available RAM.",
  ],
  flash: [
    "Flashing guide tested on macOS, Linux (Ubuntu 22.04), and Windows 11 (WSL2).",
    "If device not detected, check cable (data-capable USB-C), try different port, or verify drivers.",
    "For production: use JTAG/SWD for initial flash, OTA updates for field deployment.",
  ],
  debug: [
    "Connect your device via USB to see live serial output. The debug console mirrors the serial monitor.",
    "Log levels: timestamps in brackets, subsystem tags, color-coded severity.",
    "Common issues: if WiFi fails, check SSID/password. If sensors don't init, check I2C pullups.",
  ],
};

/* ═══════════════════════════════════════
   THREE.JS 3D ENCLOSURE VIEWER
   ═══════════════════════════════════════ */

function EnclosureBox({ dims }: { dims: ProjectData["enclosure"] }) {
  const w = dims.w / 100;
  const h = dims.h / 100;
  const d = dims.d / 100;
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, d, h]} />
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.6} wireframe={false} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, d, h]} />
        <meshStandardMaterial color="#ffffff" wireframe={true} transparent opacity={0.15} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, d / 2 + 0.005, 0]}>
        <boxGeometry args={[w - 0.02, 0.01, h - 0.02]} />
        <meshStandardMaterial color="#2a2a4e" transparent opacity={0.4} />
      </mesh>
      {/* Mounting holes */}
      {dims.mountHoles > 0 && [
        [-w/2 + 0.04, -d/2 + 0.005, -h/2 + 0.04],
        [w/2 - 0.04, -d/2 + 0.005, -h/2 + 0.04],
        [-w/2 + 0.04, -d/2 + 0.005, h/2 - 0.04],
        [w/2 - 0.04, -d/2 + 0.005, h/2 - 0.04],
      ].slice(0, dims.mountHoles).map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.015, 0.015, d * 0.8, 16]} />
          <meshStandardMaterial color="#333366" transparent opacity={0.5} />
        </mesh>
      ))}
      {/* USB port cutout indicator */}
      <mesh position={[-w/2, 0, 0]}>
        <boxGeometry args={[0.005, 0.03, 0.09]} />
        <meshStandardMaterial color="#4a4a8a" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function ThreeViewer({ dims }: { dims: ProjectData["enclosure"] }) {
  return (
    <div className="h-[320px] w-full border border-white/[0.06] bg-[#050508]">
      <Canvas>
        <PerspectiveCamera makeDefault position={[2, 1.5, 2]} fov={45} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 2, -3]} intensity={0.3} />
        <Suspense fallback={null}>
          <EnclosureBox dims={dims} />
        </Suspense>
        <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={1.5} />
        <gridHelper args={[4, 20, "#111122", "#111122"]} position={[0, -0.5, 0]} />
      </Canvas>
    </div>
  );
}

/* ═══════════════════════════════════════
   SCHEMATIC SVG RENDERER
   ═══════════════════════════════════════ */

function SchematicView({ blocks }: { blocks: ProjectData["schematicBlocks"]; }) {
  const cols = Math.min(blocks.length, 3);
  const bw = 220, bh = 140, gap = 40;
  const totalW = cols * (bw + gap);
  const rows = Math.ceil(blocks.length / cols);
  const totalH = rows * (bh + gap) + 40;

  return (
    <svg viewBox={`0 0 ${totalW + 40} ${totalH}`} className="w-full" fill="none">
      {blocks.map((block, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 20 + col * (bw + gap);
        const y = 20 + row * (bh + gap);
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text x={x + bw / 2} y={y + 16} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="monospace" fontWeight="bold">{block.name}</text>
            <line x1={x + 4} y1={y + 22} x2={x + bw - 4} y2={y + 22} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            {block.pins.slice(0, 4).map((pin, j) => (
              <text key={`p${j}`} x={x + 6} y={y + 36 + j * 13} fill="rgba(255,255,255,0.25)" fontSize="8" fontFamily="monospace">{pin}</text>
            ))}
            {block.connections.slice(0, 3).map((conn, j) => (
              <text key={`c${j}`} x={x + bw - 6} y={y + 36 + j * 13} textAnchor="end" fill="rgba(255,255,255,0.15)" fontSize="7" fontFamily="monospace">{conn.slice(0, 35)}</text>
            ))}
            {/* Connection lines between blocks */}
            {i < blocks.length - 1 && col < cols - 1 && (
              <line x1={x + bw} y1={y + bh / 2} x2={x + bw + gap} y2={y + bh / 2} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 2" />
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ═══════════════════════════════════════
   GERBER VIEWER
   ═══════════════════════════════════════ */

function GerberViewer({ layers, boardDims }: { layers: GerberLayer[]; boardDims: ProjectData["boardDims"] }) {
  const [activeLayer, setActiveLayer] = useState(0);
  const layer = layers[activeLayer];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-[10px] text-white/20">
        <span>Board: {boardDims.w}x{boardDims.h}mm</span>
        <span>{boardDims.layers}-layer stackup</span>
        <span>{layers.length} Gerber files</span>
      </div>
      <div className="flex gap-3">
        <div className="w-48 flex-shrink-0 space-y-px">
          {layers.map((l, i) => (
            <button key={i} onClick={() => setActiveLayer(i)}
              className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-[10px] transition-colors ${activeLayer === i ? "bg-white/[0.04] text-white/50" : "text-white/20 hover:text-white/35"}`}>
              <div className="h-2 w-2 flex-shrink-0" style={{ backgroundColor: l.color, opacity: activeLayer === i ? 1 : 0.3 }} />
              <span className="flex-1 truncate">{l.name}</span>
              <span className="tabular-nums text-white/10">{l.elements}</span>
            </button>
          ))}
        </div>
        <div className="flex-1">
          <div className="border border-white/[0.06] bg-[#050508] p-3">
            <svg viewBox="0 0 300 200" className="w-full" fill="none">
              <rect x="10" y="10" width="280" height="180" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="rgba(255,255,255,0.01)" />
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={`v${i}`} x1={10 + i * 20} y1={10} x2={10 + i * 20} y2={190} stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`h${i}`} x1={10} y1={10 + i * 20} x2={290} y2={10 + i * 20} stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
              ))}
              {/* Simulated traces */}
              <path d="M40 50 L100 50 L100 100 L160 100 L160 60 L220 60" stroke={layer?.color} strokeWidth="1.2" opacity={0.6} fill="none" />
              <path d="M60 140 L120 140 L120 80 L180 80" stroke={layer?.color} strokeWidth="0.8" opacity={0.5} fill="none" />
              <path d="M200 40 L260 40 L260 120 L200 120" stroke={layer?.color} strokeWidth="1" opacity={0.4} fill="none" />
              <path d="M30 90 L80 90 L80 160 L150 160" stroke={layer?.color} strokeWidth="0.6" opacity={0.3} fill="none" />
              {/* IC footprints */}
              {[[70, 70], [180, 90], [240, 150], [50, 130]].map(([cx, cy], i) => (
                <g key={i}>
                  <rect x={cx - 15} y={cy - 10} width={30} height={20} fill="rgba(255,255,255,0.03)" stroke={layer?.color} strokeWidth="0.5" strokeOpacity={0.3} />
                  <circle cx={cx - 10} cy={cy - 5} r={1.5} fill={layer?.color} fillOpacity={0.3} />
                </g>
              ))}
              {/* Drill holes */}
              {[[25, 25], [275, 25], [25, 175], [275, 175]].map(([x, y], i) => (
                <circle key={`drill${i}`} cx={x} cy={y} r={4} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              ))}
            </svg>
          </div>
          <p className="mt-2 text-[10px] text-white/15">{layer?.desc}</p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   PLACEMENT DIAGRAM SVG
   ═══════════════════════════════════════ */

function PlacementDiagram({ rows, boardDims }: { rows: PlacementRow[]; boardDims: ProjectData["boardDims"] }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[10px] tracking-[0.15em] text-white/15 uppercase">Placement diagram</p>
      <div className="border border-white/[0.06] bg-[#050508] p-3">
        <svg viewBox="0 0 300 180" className="w-full" fill="none">
          <rect x="10" y="10" width="280" height="160" stroke="rgba(255,255,255,0.1)" strokeWidth="1" rx="2" fill="rgba(255,255,255,0.01)" />
          {rows.slice(0, 10).map((row, i) => {
            const cx = 30 + (i % 5) * 55;
            const cy = 35 + Math.floor(i / 5) * 65;
            const isTop = row.side === "Top";
            return (
              <g key={i}>
                <rect x={cx - 18} y={cy - 12} width={36} height={24}
                  fill={isTop ? "rgba(255,255,255,0.04)" : "rgba(100,100,255,0.04)"}
                  stroke={isTop ? "rgba(255,255,255,0.15)" : "rgba(100,100,255,0.15)"}
                  strokeWidth="0.5" />
                <text x={cx} y={cy - 2} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="monospace" fontWeight="bold">{row.ref}</text>
                <text x={cx} y={cy + 8} textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="5" fontFamily="monospace">{row.component.slice(0, 12)}</text>
              </g>
            );
          })}
          <text x={290} y={178} textAnchor="end" fill="rgba(255,255,255,0.1)" fontSize="7" fontFamily="monospace">{boardDims.w}x{boardDims.h}mm</text>
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   WAITLIST MODAL
   ═══════════════════════════════════════ */

function WaitlistModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80"
      onClick={(e) => { if (e.target === e.currentTarget) { onClose(); setSubmitted(false); setEmail(""); } }}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-white/[0.08] bg-[#0A0A0E] p-8" onClick={e => e.stopPropagation()}>
        {!submitted ? (
          <>
            <p className="text-[10px] tracking-[0.2em] text-white/25 uppercase">Early access</p>
            <h3 className="mt-2 text-[20px] font-light tracking-tight text-white/80">Join the waitlist</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-white/30">Get full Gerber exports, production firmware, 3D-printable enclosures, and debug tooling.</p>
            <form onSubmit={e => { e.preventDefault(); if (email.trim()) setSubmitted(true); }} className="mt-6 flex gap-2">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required
                className="flex-1 border border-white/[0.08] bg-transparent px-3 py-2.5 text-[13px] text-white/60 placeholder-white/15 outline-none focus:border-white/20" />
              <button type="submit" className="bg-white px-5 py-2.5 text-[11px] font-medium tracking-wider text-[#0A0A0E] uppercase hover:bg-white/90">Join</button>
            </form>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center border border-white/[0.12]">
              <Mail className="h-4 w-4 text-white/50" />
            </div>
            <p className="text-[16px] font-light text-white/70">You are on the list.</p>
            <p className="mt-2 text-[12px] text-white/25">We will reach out when your spot opens.</p>
            <button onClick={() => { onClose(); setSubmitted(false); setEmail(""); }}
              className="mt-6 text-[11px] tracking-wider text-white/30 underline decoration-white/10 hover:text-white/50">Back to demo</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   CHAT PANEL
   ═══════════════════════════════════════ */

interface ChatMsg { role: "user" | "assistant"; text: string }

function ChatPanel({
  messages, onSend, generating, tabLabel, disabled
}: {
  messages: ChatMsg[]; onSend: (msg: string) => void; generating: boolean; tabLabel: string; disabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-7 flex-shrink-0 items-center border-b border-white/[0.06] px-3">
        <span className="text-[9px] tracking-[0.2em] text-white/20 uppercase">{tabLabel} chat</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.04) transparent" }}>
        <div className="space-y-2 p-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "ml-3" : ""}>
              <div className={`text-[11px] leading-[1.6] ${m.role === "user" ? "bg-white/[0.04] p-2 text-white/45" : "border-l border-white/[0.06] pl-2 text-white/30"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {generating && (
            <div className="border-l border-white/[0.06] pl-2">
              <div className="flex items-center gap-1">
                {[0, 1, 2].map(i => <div key={i} className="h-1 w-1 animate-pulse rounded-full bg-white/15" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
      <div className="flex-shrink-0 border-t border-white/[0.06] p-2">
        <div className="flex items-center gap-1.5">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && input.trim() && !generating && !disabled) { onSend(input.trim()); setInput(""); } }}
            placeholder={disabled ? "Connect device first..." : `Ask about ${tabLabel.toLowerCase()}...`}
            disabled={generating || disabled}
            className="flex-1 bg-transparent px-1.5 py-1 text-[11px] text-white/45 placeholder-white/[0.12] outline-none" />
          <button onClick={() => { if (input.trim() && !generating && !disabled) { onSend(input.trim()); setInput(""); } }}
            disabled={!input.trim() || generating || disabled}
            className="flex h-6 w-6 items-center justify-center text-white/15 hover:text-white/35 disabled:opacity-15">
            <Send className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN DEMO MODAL
   ═══════════════════════════════════════ */

export function DemoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<"select" | "workspace">("select");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeSpace, setActiveSpace] = useState<SpaceId>("electronics");
  const [elecTab, setElecTab] = useState<ElecTab>("schematic");
  const [cadTab, setCadTab] = useState<CadTab>("viewer");
  const [fwTab, setFwTab] = useState<FwTab>("code");
  const [showWaitlist, setShowWaitlist] = useState(false);

  // Per-tab chats
  const allTabs: ChatTabKey[] = ["schematic", "placement", "gerber", "viewer", "simulation", "testing", "math", "code", "flash", "debug"];
  const [chats, setChats] = useState<Record<ChatTabKey, ChatMsg[]>>(() => {
    const init: Record<string, ChatMsg[]> = {};
    allTabs.forEach(t => init[t] = []);
    return init as Record<ChatTabKey, ChatMsg[]>;
  });
  const [chatGen, setChatGen] = useState(false);
  const chatIdxRef = useRef<Record<ChatTabKey, number>>(
    Object.fromEntries(allTabs.map(t => [t, 0])) as Record<ChatTabKey, number>
  );

  // Get current active chat tab key
  const activeChatTab: ChatTabKey = activeSpace === "electronics" ? elecTab
    : activeSpace === "cad" ? cadTab
    : activeSpace === "firmware" ? fwTab
    : "debug";

  const data = selectedSlug ? allProjects[selectedSlug] : null;

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function handleClose() {
    setPhase("select");
    setSelectedSlug(null);
    setGenerating(false);
    setActiveSpace("electronics");
    setElecTab("schematic");
    setCadTab("viewer");
    setFwTab("code");
    const init: Record<string, ChatMsg[]> = {};
    allTabs.forEach(t => init[t] = []);
    setChats(init as Record<ChatTabKey, ChatMsg[]>);
    onClose();
  }

  const startWorkspace = useCallback((slug: string, title: string) => {
    setSelectedSlug(slug);
    setGenerating(true);
    setPhase("workspace");

    setTimeout(() => {
      const d = allProjects[slug];
      if (!d) { setGenerating(false); return; }
      const init: Record<string, ChatMsg[]> = {};
      init.schematic = [{ role: "assistant", text: `Schematic generated for "${d.name}". ${d.schematicBlocks.length} functional blocks with complete netlist. All connections verified.` }];
      init.placement = [{ role: "assistant", text: `Component placement: ${d.placementRows.length} components on ${d.boardDims.w}x${d.boardDims.h}mm ${d.boardDims.layers}-layer board. Placement optimized for signal integrity and thermal performance.` }];
      init.gerber = [{ role: "assistant", text: `${d.gerberLayers.length} Gerber layers generated. Board passes DRC. Ready for fabrication at JLCPCB, PCBWay, or OSH Park.` }];
      init.viewer = [{ role: "assistant", text: `3D enclosure: ${d.enclosure.w}x${d.enclosure.h}x${d.enclosure.d}mm, ${d.enclosure.material}, ${d.enclosure.weight}. Rotate the model to inspect from all angles.` }];
      init.simulation = [{ role: "assistant", text: `${d.simResults.length} simulations complete. ${d.simResults.filter(s => s.status === "pass").length} passed, ${d.simResults.filter(s => s.status === "warn").length} warnings, ${d.simResults.filter(s => s.status === "fail").length} failures.` }];
      init.testing = [{ role: "assistant", text: `Test suite: ${d.testCases.length} test cases. ${d.testCases.filter(t => t.status === "pass").length}/${d.testCases.length} passing.` }];
      init.math = [{ role: "assistant", text: `${d.equations.length} design equations computed. All values cross-verified against simulation results.` }];
      init.code = [{ role: "assistant", text: `Firmware: ${d.firmware.split("\n").length} lines for ${d.mcu}. Compiles clean. All pin assignments match schematic.` }];
      init.flash = [{ role: "assistant", text: `Flashing guide: ${d.flashSteps.length} steps. Tested on macOS, Linux, Windows.` }];
      init.debug = [{ role: "assistant", text: `Debug console ready. Connect your ${d.mcu} via USB to see live output.` }];
      setChats(init as Record<ChatTabKey, ChatMsg[]>);
      setGenerating(false);
    }, 2000);
  }, []);

  function handleChatSend(msg: string) {
    setChatGen(true);
    setChats(prev => ({ ...prev, [activeChatTab]: [...prev[activeChatTab], { role: "user" as const, text: msg }] }));
    setTimeout(() => {
      const responses = chatResponses[activeChatTab];
      const ref = chatIdxRef.current as unknown as Record<ChatTabKey, number>;
      const idx = (ref[activeChatTab] || 0) % responses.length;
      ref[activeChatTab] = idx + 1;
      setChats(prev => ({ ...prev, [activeChatTab]: [...prev[activeChatTab], { role: "assistant" as const, text: responses[idx] }] }));
      setChatGen(false);
    }, 1000);
  }

  const bomTotal = data?.bom.reduce((s, b) => s + b.total, 0) || 0;

  /* ─── Sub-tab buttons ─── */
  const SubTabs = ({ tabs, active, onChange }: { tabs: { id: string; label: string; icon: typeof Cpu }[]; active: string; onChange: (id: string) => void }) => (
    <div className="flex h-7 items-center gap-px border-b border-white/[0.06] px-3">
      {tabs.map(t => {
        const Icon = t.icon;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] transition-colors ${active === t.id ? "bg-white/[0.04] text-white/50" : "text-white/15 hover:text-white/30"}`}>
            <Icon className="h-3 w-3" />
            {t.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85"
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.12 }}
            className="relative flex h-[94vh] w-[97vw] max-w-[1500px] flex-col border border-white/[0.08] bg-[#08080C]"
            onClick={e => e.stopPropagation()}>

            {/* Top bar */}
            <div className="flex h-8 flex-shrink-0 items-center justify-between border-b border-white/[0.06] px-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] tracking-[0.2em] text-white/25 uppercase">
                  {phase === "select" ? "Try Bleuprint" : data?.name}
                </span>
                {phase === "workspace" && (
                  <button onClick={() => setShowWaitlist(true)}
                    className="bg-white/[0.06] px-3 py-0.5 text-[9px] tracking-wider text-white/40 uppercase hover:bg-white/[0.1] hover:text-white/60">
                    Join waitlist
                  </button>
                )}
              </div>
              <button onClick={handleClose} className="text-white/20 hover:text-white/40">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* SELECT PHASE */}
            {phase === "select" && (
              <div className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-md">
                  <h2 className="text-[22px] font-light tracking-tight text-white/80">What are you building?</h2>
                  <p className="mt-1 text-[12px] text-white/25">Select a project. We generate everything.</p>
                  <div className="mt-6 space-y-px">
                    {presets.map((p, i) => {
                      const Icon = p.icon;
                      return (
                        <button key={i} onClick={() => startWorkspace(p.slug, p.title)}
                          className="group flex w-full items-center gap-3 px-3 py-2.5 text-left transition-all hover:bg-white/[0.03]">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center border border-white/[0.08] group-hover:border-white/15">
                            <Icon className="h-3 w-3 text-white/30" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] font-medium text-white/50 group-hover:text-white/70">{p.title}</p>
                            <p className="text-[10px] text-white/15">{p.brief}</p>
                          </div>
                          <ChevronRight className="h-3 w-3 text-white/[0.08] group-hover:text-white/25" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* WORKSPACE PHASE */}
            {phase === "workspace" && data && (
              <div className="flex flex-1 overflow-hidden">
                {/* Left: space nav */}
                <div className="flex w-10 flex-shrink-0 flex-col items-center gap-px border-r border-white/[0.06] py-2">
                  {spaces.map(s => {
                    const Icon = s.icon;
                    return (
                      <button key={s.id} onClick={() => setActiveSpace(s.id)} title={s.label}
                        className={`flex h-8 w-8 items-center justify-center transition-colors ${activeSpace === s.id ? "bg-white/[0.06] text-white/60" : "text-white/15 hover:text-white/30"}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    );
                  })}
                </div>

                {/* Center: canvas */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  {/* Sub-tabs */}
                  {activeSpace === "electronics" && (
                    <SubTabs
                      tabs={[
                        { id: "schematic", label: "Schematic", icon: CircuitBoard },
                        { id: "placement", label: "Placement", icon: LayoutGrid },
                        { id: "gerber", label: "Gerber Files", icon: Layers },
                      ]}
                      active={elecTab}
                      onChange={id => setElecTab(id as ElecTab)}
                    />
                  )}
                  {activeSpace === "cad" && (
                    <SubTabs
                      tabs={[
                        { id: "viewer", label: "3D Model", icon: Box },
                        { id: "simulation", label: "Simulation", icon: FlaskConical },
                        { id: "testing", label: "Testing", icon: TestTube },
                        { id: "math", label: "Math / Physics", icon: Calculator },
                      ]}
                      active={cadTab}
                      onChange={id => setCadTab(id as CadTab)}
                    />
                  )}
                  {activeSpace === "firmware" && (
                    <SubTabs
                      tabs={[
                        { id: "code", label: "Firmware Code", icon: FileCode },
                        { id: "flash", label: "Flash Steps", icon: Zap },
                      ]}
                      active={fwTab}
                      onChange={id => setFwTab(id as FwTab)}
                    />
                  )}
                  {activeSpace === "debug" && (
                    <div className="flex h-7 items-center border-b border-white/[0.06] px-3">
                      <Bug className="mr-1.5 h-3 w-3 text-white/15" />
                      <span className="text-[10px] text-white/20">Debug Console</span>
                    </div>
                  )}

                  {/* Download button bar */}
                  <div className="flex h-6 flex-shrink-0 items-center justify-end border-b border-white/[0.04] px-3">
                    {(activeSpace === "electronics" && elecTab === "gerber") && (
                      <button onClick={() => setShowWaitlist(true)} className="flex items-center gap-1 text-[9px] text-white/15 hover:text-white/30">
                        <Download className="h-2.5 w-2.5" /> Download Gerber ZIP
                      </button>
                    )}
                    {(activeSpace === "cad" && cadTab === "viewer") && (
                      <button onClick={() => setShowWaitlist(true)} className="flex items-center gap-1 text-[9px] text-white/15 hover:text-white/30">
                        <Download className="h-2.5 w-2.5" /> Download STL / STEP
                      </button>
                    )}
                    {(activeSpace === "firmware" && fwTab === "code") && (
                      <button onClick={() => setShowWaitlist(true)} className="flex items-center gap-1 text-[9px] text-white/15 hover:text-white/30">
                        <Download className="h-2.5 w-2.5" /> Download firmware
                      </button>
                    )}
                  </div>

                  {/* Main content area */}
                  <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.04) transparent" }}>
                    {generating ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center">
                          <div className="relative mx-auto mb-3 h-6 w-6">
                            <div className="absolute inset-0 animate-spin border border-white/[0.08] border-t-white/30" style={{ animationDuration: "1s" }} />
                          </div>
                          <p className="text-[11px] text-white/20">Generating all artifacts...</p>
                        </div>
                      </div>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.div key={`${activeSpace}-${activeChatTab}`} initial={{ opacity: 0, x: 4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }} transition={{ duration: 0.1 }}>

                          {/* ELECTRONICS: Schematic */}
                          {activeSpace === "electronics" && elecTab === "schematic" && (
                            <div>
                              <p className="mb-3 text-[10px] tracking-[0.15em] text-white/20 uppercase">Schematic -- {data.schematicBlocks.length} blocks</p>
                              <SchematicView blocks={data.schematicBlocks} />
                              <div className="mt-4">
                                <p className="mb-2 text-[10px] tracking-[0.15em] text-white/15 uppercase">Netlist</p>
                                <div className="border border-white/[0.04] bg-[#050508] p-3">
                                  <pre className="overflow-x-auto font-mono text-[10px] leading-[1.7] text-white/30">{data.netlist}</pre>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ELECTRONICS: Placement */}
                          {activeSpace === "electronics" && elecTab === "placement" && (
                            <div>
                              <p className="mb-3 text-[10px] tracking-[0.15em] text-white/20 uppercase">
                                Component placement -- {data.placementRows.length} components on {data.boardDims.w}x{data.boardDims.h}mm
                              </p>
                              <table className="w-full text-[11px]">
                                <thead>
                                  <tr className="border-b border-white/[0.06]">
                                    {["Ref", "Component", "X", "Y", "Rot", "Side"].map(h => (
                                      <th key={h} className="pb-2 pr-3 text-left text-[9px] font-normal tracking-wider text-white/20 uppercase">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.placementRows.map((row, i) => (
                                    <tr key={i} className="border-b border-white/[0.03]">
                                      <td className="py-1.5 pr-3 font-mono text-white/45">{row.ref}</td>
                                      <td className="py-1.5 pr-3 text-white/35">{row.component}</td>
                                      <td className="py-1.5 pr-3 tabular-nums text-white/25">{row.x}</td>
                                      <td className="py-1.5 pr-3 tabular-nums text-white/25">{row.y}</td>
                                      <td className="py-1.5 pr-3 tabular-nums text-white/25">{row.rotation}</td>
                                      <td className="py-1.5 text-white/25">{row.side}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <PlacementDiagram rows={data.placementRows} boardDims={data.boardDims} />
                            </div>
                          )}

                          {/* ELECTRONICS: Gerber */}
                          {activeSpace === "electronics" && elecTab === "gerber" && (
                            <GerberViewer layers={data.gerberLayers} boardDims={data.boardDims} />
                          )}

                          {/* CAD: 3D Viewer */}
                          {activeSpace === "cad" && cadTab === "viewer" && (
                            <div>
                              <p className="mb-3 text-[10px] tracking-[0.15em] text-white/20 uppercase">3D Enclosure -- interactive</p>
                              <ThreeViewer dims={data.enclosure} />
                              <div className="mt-4 grid grid-cols-3 gap-4 text-[11px]">
                                <div><p className="text-white/15">Dimensions</p><p className="mt-0.5 text-white/40">{data.enclosure.w}x{data.enclosure.h}x{data.enclosure.d}mm</p></div>
                                <div><p className="text-white/15">Material</p><p className="mt-0.5 text-white/40">{data.enclosure.material}</p></div>
                                <div><p className="text-white/15">Weight</p><p className="mt-0.5 text-white/40">{data.enclosure.weight}</p></div>
                              </div>
                              <div className="mt-4">
                                <p className="mb-2 text-[10px] tracking-[0.15em] text-white/15 uppercase">Build specifications</p>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-[11px]">
                                  {Object.entries(data.enclosure.printSettings).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                      <span className="text-white/20">{k}</span>
                                      <span className="text-white/40">{v}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* CAD: Simulation */}
                          {activeSpace === "cad" && cadTab === "simulation" && (
                            <div>
                              <p className="mb-3 text-[10px] tracking-[0.15em] text-white/20 uppercase">Simulation results</p>
                              <div className="space-y-2">
                                {data.simResults.map((r, i) => (
                                  <div key={i} className="flex items-center justify-between border-b border-white/[0.03] py-2">
                                    <span className="text-[11px] text-white/40">{r.parameter}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-[11px] tabular-nums text-white/30">{r.value}</span>
                                      <span className={`text-[9px] font-medium tracking-wider uppercase ${r.status === "pass" ? "text-green-500/60" : r.status === "warn" ? "text-yellow-500/60" : "text-red-500/60"}`}>{r.status}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CAD: Testing */}
                          {activeSpace === "cad" && cadTab === "testing" && (
                            <div>
                              <p className="mb-3 text-[10px] tracking-[0.15em] text-white/20 uppercase">Test cases</p>
                              <table className="w-full text-[11px]">
                                <thead>
                                  <tr className="border-b border-white/[0.06]">
                                    {["Test", "Expected", "Actual", ""].map(h => (
                                      <th key={h} className="pb-2 pr-3 text-left text-[9px] font-normal tracking-wider text-white/20 uppercase">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.testCases.map((t, i) => (
                                    <tr key={i} className="border-b border-white/[0.03]">
                                      <td className="py-1.5 pr-3 text-white/40">{t.name}</td>
                                      <td className="py-1.5 pr-3 font-mono text-[10px] text-white/25">{t.expected}</td>
                                      <td className="py-1.5 pr-3 font-mono text-[10px] text-white/25">{t.actual}</td>
                                      <td className="py-1.5">
                                        <span className={`text-[9px] font-medium tracking-wider uppercase ${t.status === "pass" ? "text-green-500/60" : "text-red-500/60"}`}>{t.status}</span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* CAD: Math/Physics */}
                          {activeSpace === "cad" && cadTab === "math" && (
                            <div>
                              <p className="mb-3 text-[10px] tracking-[0.15em] text-white/20 uppercase">Design equations</p>
                              <div className="space-y-3">
                                {data.equations.map((eq, i) => (
                                  <div key={i} className="border-l border-white/[0.06] pl-3">
                                    <p className="text-[11px] text-white/45">{eq.name}</p>
                                    <div className="mt-1 border border-white/[0.04] bg-[#050508] px-3 py-1.5">
                                      <code className="font-mono text-[10px] text-white/30">{eq.formula}</code>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-[10px]">
                                      <span className="text-white/15">Result:</span>
                                      <span className="font-mono text-white/40">{eq.result}</span>
                                      <span className="text-white/15">{eq.unit}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* FIRMWARE: Code */}
                          {activeSpace === "firmware" && fwTab === "code" && (
                            <div>
                              <div className="mb-3 flex items-center justify-between">
                                <p className="text-[10px] tracking-[0.15em] text-white/20 uppercase">Firmware -- {data.mcu}</p>
                                <span className="text-[10px] tabular-nums text-white/[0.12]">{data.firmware.split("\n").length} lines</span>
                              </div>
                              <div className="border border-white/[0.04] bg-[#050508] p-4">
                                <pre className="overflow-x-auto font-mono text-[10px] leading-[1.7] text-white/40">{data.firmware}</pre>
                              </div>
                            </div>
                          )}

                          {/* FIRMWARE: Flash */}
                          {activeSpace === "firmware" && fwTab === "flash" && (
                            <div>
                              <p className="mb-3 text-[10px] tracking-[0.15em] text-white/20 uppercase">Flash guide -- {data.flashSteps.length} steps</p>
                              <div className="space-y-3">
                                {data.flashSteps.map(step => (
                                  <div key={step.step} className="border-l border-white/[0.06] pl-3">
                                    <div className="flex items-baseline gap-2">
                                      <span className="font-mono text-[10px] tabular-nums text-white/15">{String(step.step).padStart(2, "0")}</span>
                                      <p className="text-[12px] text-white/50">{step.title}</p>
                                    </div>
                                    <div className="mt-1 ml-5 border border-white/[0.04] bg-[#050508] px-3 py-1.5">
                                      <pre className="font-mono text-[10px] text-white/30 whitespace-pre-wrap">{step.command}</pre>
                                    </div>
                                    <p className="mt-1 ml-5 text-[10px] text-white/15">{step.note}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* DEBUG: Device not connected */}
                          {activeSpace === "debug" && (
                            <div>
                              <div className="mb-4 flex items-center gap-3 border border-yellow-500/10 bg-yellow-500/[0.03] p-3">
                                <WifiOff className="h-4 w-4 flex-shrink-0 text-yellow-500/40" />
                                <div>
                                  <p className="text-[12px] text-yellow-200/50">No device connected</p>
                                  <p className="mt-0.5 text-[10px] text-yellow-200/25">Connect your {data.mcu} via USB to see live serial output. The debug console requires a physical connection.</p>
                                </div>
                              </div>
                              <div className="border border-white/[0.04] bg-[#050508] p-4">
                                <div className="mb-3 flex items-center gap-2 border-b border-white/[0.04] pb-2">
                                  <Terminal className="h-3 w-3 text-white/20" />
                                  <span className="text-[10px] text-white/20">Serial Monitor @ 115200 baud</span>
                                  <span className="ml-auto flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500/50" />
                                    <span className="text-[9px] text-yellow-200/25">Waiting for device</span>
                                  </span>
                                </div>
                                <p className="mb-3 text-[10px] text-white/15">Simulated output (preview):</p>
                                <pre className="font-mono text-[10px] leading-[1.8] text-white/25">
                                  {data.debugLog.map((line, i) => (
                                    <span key={i} className={
                                      line.includes("error") || line.includes("ERROR") ? "text-red-400/50" :
                                      line.includes("WARN") || line.includes("warn") ? "text-yellow-400/50" :
                                      line.includes("OK") || line.includes("Ready") || line.includes("pass") ? "text-green-400/30" :
                                      line.startsWith("---") || line === "" ? "text-white/10" : ""
                                    }>{line}{"\n"}</span>
                                  ))}
                                </pre>
                              </div>
                              <div className="mt-3 text-[10px] text-white/15">
                                <p className="mb-1 font-medium text-white/25">To connect:</p>
                                <ol className="ml-4 list-decimal space-y-0.5">
                                  <li>Plug {data.mcu} into USB port</li>
                                  <li>Verify device appears (<code className="text-white/20">ls /dev/tty*</code>)</li>
                                  <li>Click &ldquo;Connect&rdquo; below to start live monitoring</li>
                                </ol>
                                <button className="mt-3 flex items-center gap-1.5 border border-white/[0.08] px-3 py-1.5 text-white/30 hover:border-white/15 hover:text-white/45">
                                  <Wifi className="h-3 w-3" />
                                  <span>Connect device</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* BOM overlay for electronics space */}
                          {activeSpace === "electronics" && (
                            <div className="mt-6 border-t border-white/[0.04] pt-4">
                              <div className="mb-2 flex items-center justify-between">
                                <p className="text-[10px] tracking-[0.15em] text-white/15 uppercase">Bill of materials</p>
                                <span className="font-mono text-[11px] text-white/30">{data.bom.length} items -- ${bomTotal.toFixed(2)}</span>
                              </div>
                              <table className="w-full text-[10px]">
                                <thead>
                                  <tr className="border-b border-white/[0.04]">
                                    {["Component", "Footprint", "Qty", "Unit", "Total"].map(h => (
                                      <th key={h} className="pb-1.5 pr-2 text-left text-[9px] font-normal tracking-wider text-white/15 uppercase">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {data.bom.map((b, i) => (
                                    <tr key={i} className="border-b border-white/[0.02]">
                                      <td className="py-1 pr-2 text-white/35">{b.component}</td>
                                      <td className="py-1 pr-2 font-mono text-white/15">{b.footprint}</td>
                                      <td className="py-1 pr-2 tabular-nums text-white/25">{b.qty}</td>
                                      <td className="py-1 pr-2 tabular-nums text-white/20">${b.unit.toFixed(2)}</td>
                                      <td className="py-1 tabular-nums text-white/30">${b.total.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                {/* Right: chat panel */}
                <div className="flex w-[260px] flex-shrink-0 flex-col border-l border-white/[0.06]">
                  <ChatPanel
                    messages={chats[activeChatTab] || []}
                    onSend={handleChatSend}
                    generating={chatGen}
                    tabLabel={activeChatTab.charAt(0).toUpperCase() + activeChatTab.slice(1)}
                    disabled={activeSpace === "debug"}
                  />
                </div>
              </div>
            )}

            <AnimatePresence>
              {showWaitlist && <WaitlistModal open={showWaitlist} onClose={() => setShowWaitlist(false)} />}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
