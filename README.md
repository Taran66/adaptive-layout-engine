# Adaptive Layout Engine for Multi-Surface Ads

**Live demo:** https://adaptive-layout-engine-ruddy.vercel.app

A constraint-based layout engine that takes a single declarative ad spec and adapts it across fundamentally different surfaces (mobile, broadcast, kiosk) — without per-surface hardcoded layouts.

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`).

## How to run the demo

1. Open the app in your browser.
2. Use the surface picker buttons at the top (`mobilePortrait`, `mobileLandscape`, `broadcastLowerThird`, `retailKiosk`) to switch surfaces.
3. The same underlying ad spec (`src/spec.ts`) re-resolves live into a different arrangement for each surface — notice that mobile/kiosk surfaces stack elements in a column, while the wide broadcast surface lays them out in a row.
4. If a surface is too constrained to fit every element, lower-priority elements (branding, then secondary text) drop first, and this is shown in a "Dropped: ..." message beneath the preview. Priority-1 elements (headline, hero image) shrink toward a hard minimum rather than overflowing, if space is still insufficient after dropping everything droppable.

To manually test the degradation path yourself: temporarily edit `retailKiosk` in `src/surfaces.ts` to a smaller width (e.g. `400`) and reload — you should see elements drop cleanly with no overlap or clipping.

## Testing the resolver directly (no browser)

```bash
npx tsx src/test-resolver.ts
```

Prints the resolved layout as JSON for a couple of surfaces — useful for verifying the algorithm output without any UI involved.

## Project structure

```
src/
├── spec.ts          # Ad content definition (elements, priorities) — surface-agnostic
├── surfaces.ts       # Surface profiles (dimensions, safe areas, hard constraints) — content-agnostic
├── resolver.ts        # Pure function: (spec, surface) -> resolved layout. All decision logic lives here.
├── render-dom.ts      # Turns resolved layout into DOM/CSS styles. Knows nothing about priorities or surfaces.
└── App.tsx            # Demo shell: surface picker + orchestration
```

See `ARCHITECTURE.md` for the full explanation of how these connect and why they're separated this way.

## Known limitations

- No animation/transition when switching between surfaces (see Bonus section for what a next iteration would add).
- Fixed element type set (`text`, `image`, `button`) — not extensible to arbitrary custom element types without editing `getMinSize()`.
- No text-measurement-aware wrapping — text element sizing uses fixed estimates rather than actually measuring rendered text.
- Large surfaces (e.g. `broadcastLowerThird` at 1920×250) are visually scaled down in the demo preview to fit the browser viewport; the resolver computes true full-scale coordinates regardless of the on-screen preview size.
- The current minimum-size heuristics (`getMinSize()`) are reasonable defaults but not derived from real content measurement — they'd need tuning against real creative assets in a production version.

## Time spent

[Fill in — e.g. "~14 hours across 4 days"]

## AI tool disclosure

I used Claude (Anthropic) to help design and review the constraint-resolution algorithm, discuss architecture tradeoffs, and debug layout issues during development. All code was reviewed, tested, and understood by me, and I can walk through and explain any part of it.
