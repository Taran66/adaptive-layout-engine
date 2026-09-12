// src/surfaces.ts

export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SurfaceProfile {
  id: string;
  width: number;
  height: number;
  safeArea?: SafeArea;
  minTapTarget?: number;   // px — for touch surfaces
  minTextSize?: number;    // px — for far-viewing-distance surfaces
  touchOnly?: boolean;
  viewingDistance?: "near" | "far";
}

export const surfaces: Record<string, SurfaceProfile> = {
  mobilePortrait: {
    id: "mobilePortrait",
    width: 320,
    height: 480,
    safeArea: { top: 20, right: 8, bottom: 20, left: 8 },
    minTapTarget: 44,
    touchOnly: true,
  },
  mobileLandscape: {
    id: "mobileLandscape",
    width: 480,
    height: 320,
    safeArea: { top: 8, right: 20, bottom: 8, left: 20 },
    minTapTarget: 44,
    touchOnly: true,
  },
  broadcastLowerThird: {
    id: "broadcastLowerThird",
    width: 1020,
    height: 250,
    viewingDistance: "far",
    minTextSize: 32,
  },
  retailKiosk: {
    id: "retailKiosk",
    width: 1080,
    height: 1080,
    minTapTarget: 60,
    touchOnly: true,
  },
};