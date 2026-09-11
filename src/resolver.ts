// src/resolver.ts
import type { AdElement, AdSpec } from "./spec";
import type { SurfaceProfile } from "./surfaces";

export interface ResolvedElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

export interface ResolvedLayout {
  surfaceId: string;
  elements: ResolvedElement[];
}

type Orientation = "row" | "column";

function getContentArea(surface: SurfaceProfile) {
  const sa = surface.safeArea ?? { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    x: sa.left,
    y: sa.top,
    width: surface.width - sa.left - sa.right,
    height: surface.height - sa.top - sa.bottom,
  };
}

function getOrientation(width: number, height: number): Orientation {
  return width / height >= 1.4 ? "row" : "column";
}

// Minimum viable size for an element on a given surface.
// This is the heuristic you'll likely want to tune as you test real specs.
function getMinSize(el: AdElement, surface: SurfaceProfile, orientation: Orientation) {
  const base = { width: 80, height: 40 }; // fallback default

  if (el.type === "button") {
    const tap = surface.minTapTarget ?? 32;
    return { width: Math.max(tap * 2, 80), height: tap };
  }
  if (el.type === "text") {
    const textH = surface.minTextSize ?? 16;
    return { width: orientation === "row" ? 120 : 160, height: textH + 12 };
  }
  if (el.type === "image" && el.role === "hero") {
    return orientation === "row"
      ? { width: 140, height: 100 }
      : { width: 160, height: 120 };
  }
  if (el.type === "image" && el.role === "branding") {
    return { width: 48, height: 48 };
  }
  return base;
}

export function resolveLayout(spec: AdSpec, surface: SurfaceProfile): ResolvedLayout {
  const content = getContentArea(surface);
  const orientation = getOrientation(content.width, content.height);
  const mainAxisTotal = orientation === "row" ? content.width : content.height;

  // Sort by priority ascending (1 = highest, placed/considered first)
  let candidates = [...spec.elements].sort((a, b) => a.priority - b.priority);

  const sizes = new Map(
    candidates.map((el) => [el.id, getMinSize(el, surface, orientation)])
  );

  const mainAxisSize = (el: AdElement) =>
    orientation === "row" ? sizes.get(el.id)!.width : sizes.get(el.id)!.height;

  // Drop lowest-priority elements until what remains fits.
  // Never drop priority 1.
  let visible = [...candidates];
  const dropped: string[] = [];

  const totalRequired = () =>
    visible.reduce((sum, el) => sum + mainAxisSize(el), 0);

  while (totalRequired() > mainAxisTotal) {
    // Find the lowest-priority droppable element (highest priority number, excluding 1)
    const droppableIdx = [...visible]
      .reverse()
      .findIndex((el) => el.priority > 1);
    if (droppableIdx === -1) break; // only priority-1 left; can't drop further

    const idx = visible.length - 1 - droppableIdx;
    dropped.push(visible[idx].id);
    visible = visible.filter((_, i) => i !== idx);
  }

  // Place surviving elements sequentially along the main axis
  let cursor = orientation === "row" ? content.x : content.y;
  const resolvedVisible: ResolvedElement[] = visible.map((el) => {
    const size = sizes.get(el.id)!;
    const resolved: ResolvedElement = {
      id: el.id,
      x: orientation === "row" ? cursor : content.x,
      y: orientation === "row" ? content.y : cursor,
      width: orientation === "row" ? size.width : content.width,
      height: orientation === "row" ? content.height : size.height,
      visible: true,
    };
    cursor += mainAxisSize(el);
    return resolved;
  });

  const resolvedDropped: ResolvedElement[] = dropped.map((id) => ({
    id,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    visible: false,
  }));

  return {
    surfaceId: surface.id,
    elements: [...resolvedVisible, ...resolvedDropped],
  };
}

import { productAdSpec } from "./spec";
import { surfaces } from "./surfaces";

console.log(JSON.stringify(resolveLayout(productAdSpec, surfaces.retailKiosk), null, 2));
console.log(JSON.stringify(resolveLayout(productAdSpec, surfaces.broadcastLowerThird), null, 2));