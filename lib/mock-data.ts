export type StudioMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type CreationCard = {
  id: string;
  title: string;
  prompt: string;
  status: "queued" | "running" | "ready" | "failed";
  visibility: "private" | "unlisted" | "public";
  updatedAt: string;
  assetCount: number;
};

export const studioMessages: StudioMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "I want a hand-carved fox figurine that feels warm and giftable."
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "I’d shape that as one centered figurine with polished wood grain, rounded ears, and a satin ribbon loop so the final mesh reads well in 3D."
  }
];

export const creations: CreationCard[] = [
  {
    id: "c1",
    title: "Ribbon Fox",
    prompt: "A hand-carved fox figurine in maple wood with a satin ribbon loop.",
    status: "ready",
    visibility: "public",
    updatedAt: "3 minutes ago",
    assetCount: 3
  },
  {
    id: "c2",
    title: "Pocket Rocket",
    prompt: "A toy rocket with enamel panels and rounded fins.",
    status: "running",
    visibility: "private",
    updatedAt: "Just now",
    assetCount: 0
  },
  {
    id: "c3",
    title: "Lantern Whale",
    prompt: "A stylized whale carrying a brass lantern.",
    status: "queued",
    visibility: "unlisted",
    updatedAt: "8 minutes ago",
    assetCount: 0
  }
];

export const publicShare = {
  slug: "ribbon-fox-a1b2c3",
  title: "Ribbon Fox",
  prompt: "A hand-carved fox figurine in maple wood with a satin ribbon loop.",
  ownerDisplayName: "Mira",
  visibility: "public",
  shareType: "public",
  assets: [
    {
      id: "a1",
      assetType: "mesh",
      storageBucket: "giftgen-assets",
      storageKey: "creations/c1/ribbon-fox.glb",
      mimeType: "model/gltf-binary",
      fileSize: 2841142,
      createdAt: "2026-03-20T01:00:00Z"
    }
  ]
};
