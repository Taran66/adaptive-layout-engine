# Architecture

## Resolution flow

```
Ad Spec (spec.ts) + Surface Profile (surfaces.ts)
                │
                ▼
        Constraint Resolver (resolver.ts)
                │
                ▼
         Resolved Layout (typed output)
                │
                ▼
          Renderer (render-dom.ts)
                │
                ▼
        App.tsx (demo UI / orchestration)
```

Each stage only consumes the *data* produced by the stage before it — never its logic. This is the core design decision behind the whole project.

## Why this separation matters

- **`spec.ts`** describes ad *content* (elements, roles, priorities) with zero knowledge of pixels, surfaces, or screens.
- **`surfaces.ts`** describes *constraints* (dimensions, safe area, minimum tap target, minimum text size) with zero knowledge of what content will be placed on them.
- **`resolver.ts`** is the only file that makes decisions. It's a pure function — `resolveLayout(spec, surface) -> ResolvedLayout` — with no side effects, no DOM access, and no framework dependency. Same inputs always produce the same output.
- **`render-dom.ts`** consumes the resolver's plain output and turns it into DOM styles. It has no knowledge of *why* an element ended up where it did.
- **`App.tsx`** is UI glue: it holds "which surface is selected" state and wires the pieces together for a human to interact with.

**Consequence of this design:** a new surface profile can be added to `surfaces.ts` without touching `resolver.ts`. A new renderer (e.g. a Canvas backend) could be added by writing `render-canvas.ts` against the same `ResolvedLayout` type, again without touching `resolver.ts`. This is what the assignment's architecture evaluation is checking for.

## Layout algorithm, step by step

1. **Compute the content area.** Subtract the surface's `safeArea` insets from its raw width/height. All further math operates inside this smaller box.

2. **Determine orientation from aspect ratio.** `width / height >= 1.4` → row layout (used for wide surfaces like broadcast); otherwise → column layout (used for mobile/kiosk). This is what makes different surfaces produce *structurally* different arrangements rather than a uniformly scaled version of the same layout.

3. **Compute each element's minimum viable size**, based on its `type` and the surface's hard constraints (e.g. a button's minimum size is derived from `minTapTarget`; text respects `minTextSize` on far-viewing-distance surfaces).

4. **Drop lowest-priority elements first if space is insufficient.** Elements are sorted by priority ascending. While the total minimum size along the main axis exceeds available space, the resolver removes the lowest-priority *droppable* element (priority > 1) one at a time and rechecks. Priority-1 elements are never dropped.

5. **Shrink priority-1 elements if still insufficient.** If, after dropping everything droppable, priority-1 elements alone still don't fit, their size is reduced proportionally down to a hard floor (e.g. a button never shrinks below `minTapTarget`), rather than allowing overflow.

6. **Distribute leftover space.** If elements fit with room to spare, any leftover main-axis space is distributed back to priority-1 elements so they grow to fill the surface rather than leaving unused empty space.

7. **Place elements sequentially** along the main axis in their (possibly reduced) sizes, producing final `{ x, y, width, height, visible }` coordinates per element.

## Priority & degradation logic

Degradation order is strictly priority-driven and one-directional:

```
Priority 3 (branding) → dropped first
Priority 2 (secondary text, CTA) → dropped next, only if still insufficient
Priority 1 (headline, hero image) → never dropped, only shrunk to a hard floor as a last resort
```

This ordering is deterministic and independent of which specific surface is being resolved — the same priority-3-first rule applies whether the constrained surface is a known one (`retailKiosk`) or one defined for the first time at runtime (tested by resolving against an ad-hoc surface profile never referenced elsewhere in the codebase).

## Type system design

- `AdElement.type` is a string-literal union (`"text" | "image" | "button"`), and `AdElement.role`/`priority` are similarly constrained — an element with an invalid role or priority value fails at compile time.
- `ResolvedLayout`/`ResolvedElement` are explicit output types, so `render-dom.ts` (or any future renderer) consumes a fully-typed shape with no `any` and no guessing about what fields exist.
- Surface profiles (`SurfaceProfile`) type optional constraints (`minTapTarget`, `minTextSize`, `safeArea`) so a surface can omit constraints that don't apply to it, while still being fully typed.

## Limitations

- No general constraint solver (e.g. Cassowary/LP) — a deliberate choice; the assignment brief explicitly favors an explainable priority-ordered algorithm over a general-purpose solver.
- Minimum-size heuristics per element type are fixed estimates, not derived from actual text/image measurement.
- No persistence, authentication, or backend — out of scope for this assignment.
- No animated transition between surfaces (see README bonus notes).
