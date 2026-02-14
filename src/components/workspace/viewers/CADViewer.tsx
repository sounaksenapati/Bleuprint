"use client";

import { useWorkspaceStore } from "@/store/workspace-store";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import { Box, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

function parseOpenSCADDimensions(code: string) {
  const dims = { x: 60, y: 40, z: 25 };
  // Try to extract dimensions from OpenSCAD parameters
  const widthMatch = code.match(/(?:width|box_width|outer_width|enclosure_width)\s*=\s*(\d+(?:\.\d+)?)/i);
  const depthMatch = code.match(/(?:depth|box_depth|outer_depth|enclosure_depth|length|box_length)\s*=\s*(\d+(?:\.\d+)?)/i);
  const heightMatch = code.match(/(?:height|box_height|outer_height|enclosure_height)\s*=\s*(\d+(?:\.\d+)?)/i);

  if (widthMatch) dims.x = parseFloat(widthMatch[1]);
  if (depthMatch) dims.y = parseFloat(depthMatch[1]);
  if (heightMatch) dims.z = parseFloat(heightMatch[1]);

  return dims;
}

function EnclosureModel({ code }: { code: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const dims = useMemo(() => parseOpenSCADDimensions(code), [code]);

  // Normalize to a reasonable visual scale
  const scale = 40 / Math.max(dims.x, dims.y, dims.z);
  const sx = (dims.x * scale) / 20;
  const sy = (dims.z * scale) / 20;
  const sz = (dims.y * scale) / 20;

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  // Create a simple enclosure representation
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const r = 0.15;
    const w = sx;
    const h = sz;

    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

    const extrudeSettings = { depth: sy, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3 };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [sx, sy, sz]);

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} position={[0, sy / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.85} roughness={0.3} metalness={0.1} />
      </mesh>
      {/* PCB inside */}
      <mesh position={[0, sy * 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[sx * 0.8, sz * 0.8, 0.08]} />
        <meshStandardMaterial color="#059669" roughness={0.6} />
      </mesh>
      {/* Small chip on PCB */}
      <mesh position={[0, sy * 0.3 + 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <boxGeometry args={[sx * 0.2, sz * 0.2, 0.05]} />
        <meshStandardMaterial color="#1f2937" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}

function Scene({ code }: { code: string }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} />
      <EnclosureModel code={code} />
      <Grid args={[20, 20]} cellSize={0.5} cellColor="#374151" sectionSize={2} sectionColor="#4b5563" fadeDistance={15} position={[0, -0.01, 0]} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.1} minDistance={2} maxDistance={15} />
      <Environment preset="studio" />
    </>
  );
}

export function CADViewer() {
  const { artifacts, generatingArtifacts } = useWorkspaceStore();
  const cadCode = artifacts.cad;
  const isGenerating = generatingArtifacts.has("cad");

  if (isGenerating) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Generating 3D model...</p>
        </div>
      </div>
    );
  }

  if (!cadCode) {
    return (
      <div className="flex h-full items-center justify-center bg-muted/30">
        <div className="text-center">
          <Box className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No 3D model generated yet
          </p>
          <p className="text-xs text-muted-foreground/70">
            Generate a design to see the 3D preview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-[#111827]">
      <Canvas camera={{ position: [4, 3, 4], fov: 50 }} shadows>
        <Scene code={cadCode} />
      </Canvas>
      <div className="absolute bottom-3 left-3 flex gap-2">
        <Button variant="secondary" size="sm" className="gap-1.5 text-xs opacity-80">
          <RotateCcw className="h-3 w-3" />
          Drag to rotate
        </Button>
      </div>
      <div className="absolute right-3 top-3 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
        OpenSCAD Preview
      </div>
    </div>
  );
}
