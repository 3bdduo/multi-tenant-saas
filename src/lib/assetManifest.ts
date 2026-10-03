



export const IMAGE_MANIFEST = [
  "/images/nabd-logo-sm.webp",
  "/logo/arc-logo.webp",
] as const;

export type ManifestImage = (typeof IMAGE_MANIFEST)[number];
