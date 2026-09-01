



export const IMAGE_MANIFEST = [
  "/images/hero-clinic-1.jpg",
  "/images/hero-clinic-2.jpg",
] as const;

export type ManifestImage = (typeof IMAGE_MANIFEST)[number];
