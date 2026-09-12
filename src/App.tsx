// src/App.tsx
import { useState, useMemo } from "react";
import { productAdSpec } from "./spec";
import { surfaces } from "./surfaces";
import { resolveLayout } from "./resolver";
import { renderLayoutToStyles } from "./render-dom";
import "./App.css";

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
    <div className="app-container">
      <h1 className="app-title">Adaptive Layout Engine</h1>

      <div className="surface-picker">
        {Object.keys(surfaces).map((key) => (
          <button
            key={key}
            className={`surface-button ${key === surfaceKey ? "active" : ""}`}
            onClick={() => setSurfaceKey(key as keyof typeof surfaces)}
          >
            {key}
          </button>
        ))}
      </div>

      <p className="surface-label">
        Surface: {surface.width}×{surface.height}
      </p>

      <div className="surface-frame" style={containerStyle}>
        {elementStyles.map(({ id, style }) => (
          <div key={id} className="ad-element" style={style}>
            {ELEMENT_LABELS[id] ?? id}
          </div>
        ))}
      </div>

      {layout.elements.some((el) => !el.visible) && (
        <p className="dropped-message">
          Dropped: {layout.elements.filter((el) => !el.visible).map((el) => el.id).join(", ")}
        </p>
      )}
    </div>
  );
}