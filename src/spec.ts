// src/spec.ts

export type ElementType = "text" | "image" | "button";
export type ElementRole = "primary" | "hero" | "action" | "branding" | "secondary";

export interface AdElement {
  id: string;
  type: ElementType;
  role: ElementRole;
  priority: 1 | 2 | 3; // 1 = highest priority, never drops
}

export interface AdSpec {
  elements: AdElement[];
}

export function defineAd(spec: AdSpec): AdSpec {
  // Validation hook — later you can throw here if e.g. an id is duplicated
  return spec;
}


// example specs
export const productAdSpec = defineAd({
  elements: [
    { id: "headline", type: "text", role: "primary", priority: 1 },
    { id: "product-image", type: "image", role: "hero", priority: 1 },
    { id: "cta", type: "button", role: "action", priority: 2 },
    { id: "price", type: "text", role: "secondary", priority: 2 },
    { id: "logo", type: "image", role: "branding", priority: 3 },
  ],
});