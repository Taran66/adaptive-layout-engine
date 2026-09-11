// src/test-resolver.ts
import { resolveLayout } from "./resolver";
import { productAdSpec } from "./spec";
import { surfaces } from "./surfaces";

console.log("--- Kiosk ---");
console.log(JSON.stringify(resolveLayout(productAdSpec, surfaces.retailKiosk), null, 2));

console.log("--- Broadcast ---");
console.log(JSON.stringify(resolveLayout(productAdSpec, surfaces.broadcastLowerThird), null, 2));