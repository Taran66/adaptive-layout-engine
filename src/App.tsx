// import { useState } from 'react'
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App


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