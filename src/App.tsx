// src/App.tsx
import { useState, useMemo } from "react";
import { productAdSpec } from "./spec";
import { surfaces } from "./surfaces";
import { resolveLayout } from "./resolver";
import { renderLayoutToStyles } from "./render-dom";

const ELEMENT_LABELS: Record<string, string> = {
  headline: "Headline",
  "product-image": "🖼 Product Image",
  cta: "Buy Now",
  price: "$49.99",
  logo: "Logo",
};

export default function App() {
  const [surfaceKey, setSurfaceKey] = useState<keyof typeof surfaces>("mobilePortrait");
  const surface = surfaces[surfaceKey];

  const layout = useMemo(
    () => resolveLayout(productAdSpec, surface),
    [surface]
  );

  const { containerStyle, elementStyles } = renderLayoutToStyles({
    spec: productAdSpec,
    layout,
    surfaceWidth: surface.width,
    surfaceHeight: surface.height,
  });

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Adaptive Layout Engine</h1>

      <div style={{ marginBottom: 16 }}>
        {Object.keys(surfaces).map((key) => (
          <button
            key={key}
            onClick={() => setSurfaceKey(key as keyof typeof surfaces)}
            style={{
              marginRight: 8,
              fontWeight: key === surfaceKey ? "bold" : "normal",
            }}
          >
            {key}
          </button>
        ))}
      </div>

      <p>
        Surface: {surface.width}×{surface.height}
      </p>

      <div style={containerStyle}>
        {elementStyles.map(({ id, style }) => (
        <div
          key={id}
          style={{
            ...style,
            transition: "left 0.35s ease, top 0.35s ease, width 0.35s ease, height 0.35s ease",
            background: "#4f46e5",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            boxSizing: "border-box",
            border: "1px solid white",
          }}
        >
          {ELEMENT_LABELS[id] ?? id}
        </div>
      ))}
      </div>

      {layout.elements.some((el) => !el.visible) && (
        <p style={{ color: "#b91c1c", marginTop: 8 }}>
          Dropped: {layout.elements.filter((el) => !el.visible).map((el) => el.id).join(", ")}
        </p>
      )}
    </div>
  );
}