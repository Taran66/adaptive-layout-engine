// src/render-dom.ts
import type { ResolvedLayout } from "./resolver";
import type { AdSpec } from "./spec";

interface RenderProps {
  spec: AdSpec;
  layout: ResolvedLayout;
  surfaceWidth: number;
  surfaceHeight: number;
}

export function renderLayoutToStyles({ layout, surfaceWidth, surfaceHeight }: RenderProps) {
  return {
    containerStyle: {
      position: "relative" as const,
      width: surfaceWidth,
      height: surfaceHeight,
      background: "#f0f0f0",
      overflow: "hidden",
      border: "1px solid #ccc",
    },
    elementStyles: layout.elements
      .filter((el) => el.visible)
      .map((el) => ({
        id: el.id,
        style: {
          position: "absolute" as const,
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
        },
      })),
  };
}