/**
 * Every frame here came from Phantom Auto's own Instagram, and every line of
 * copy attached to a model is the line *they* wrote in that model's own post.
 * `postUrl` points back at the post the frames and the line both came from, so
 * nothing on this page can drift away from its source.
 *
 * `authorized` is set only where their caption says it in so many words —
 * "Authorized dealer" in English, "الموزع الرسمي" in Arabic. Five of the
 * thirteen models are simply "available now at Phantom Auto", and those carry
 * no badge.
 */

export type FrameRole = "ext" | "rear" | "int" | "det";

export type Frame = {
  src: string;
  role: FrameRole;
};

export type Figure = {
  /** Verbatim from their caption. */
  value: string;
  unit: string;
  /** Key into the localised figure labels. */
  key: "range" | "power" | "seats";
};

export type FleetModel = {
  id: string;
  marque: string;
  /** Latin model name, set in the display face in both locales. */
  name: string;
  year?: string;
  /** Which language they wrote this car's line in. */
  wrote: "en" | "ar";
  authorized: boolean;
  figure?: Figure;
  frames: Frame[];
  postUrl: string;
};

const f = (id: string, ext: number, rear: number, int: number, det: number): Frame[] => [
  ...Array.from({ length: ext }, (_, i) => ({
    src: `/media/${id}-ext-${String(i + 1).padStart(2, "0")}.jpg`,
    role: "ext" as const,
  })),
  ...Array.from({ length: rear }, (_, i) => ({
    src: `/media/${id}-rear-${String(i + 1).padStart(2, "0")}.jpg`,
    role: "rear" as const,
  })),
  ...Array.from({ length: int }, (_, i) => ({
    src: `/media/${id}-int-${String(i + 1).padStart(2, "0")}.jpg`,
    role: "int" as const,
  })),
  ...Array.from({ length: det }, (_, i) => ({
    src: `/media/${id}-det-${String(i + 1).padStart(2, "0")}.jpg`,
    role: "det" as const,
  })),
];

const post = (code: string) => `https://www.instagram.com/p/${code}/`;

/** Ordered newest-first, the way the cars appear in their feed. */
export const FLEET: FleetModel[] = [
  {
    id: "changan-q05",
    marque: "Changan",
    name: "Q05",
    year: "2026",
    wrote: "ar",
    authorized: false,
    frames: f("changan-q05", 2, 2, 3, 1),
    postUrl: post("Dcqwai1DLpm"),
  },
  {
    id: "deepal-g318",
    marque: "DEEPAL",
    name: "G318",
    wrote: "en",
    authorized: false,
    frames: f("deepal-g318", 3, 1, 3, 1),
    postUrl: post("DcJTvD8jATU"),
  },
  {
    id: "dfsk-e5-plus",
    marque: "DFSK",
    name: "E5 Plus",
    year: "2027",
    wrote: "ar",
    authorized: true,
    frames: f("dfsk-e5-plus", 2, 2, 3, 1),
    postUrl: post("Db_BR4ojHBa"),
  },
  {
    id: "im5",
    marque: "IM Motors",
    name: "IM5",
    year: "2026",
    wrote: "en",
    authorized: true,
    frames: f("im5", 3, 1, 2, 2),
    postUrl: post("Db6I17FDGj-"),
  },
  {
    id: "rox-adamas",
    marque: "ROX",
    name: "Adamas",
    year: "2027",
    wrote: "en",
    authorized: true,
    frames: f("rox-adamas", 3, 1, 3, 1),
    postUrl: post("DbqZB71DLHl"),
  },
  {
    id: "byd-han-l",
    marque: "BYD",
    name: "Han L DM-i",
    wrote: "en",
    authorized: false,
    figure: { value: "1400", unit: "KM", key: "range" },
    frames: f("byd-han-l", 3, 1, 2, 2),
    postUrl: post("DblIUOLjA0B"),
  },
  {
    id: "dfsk-e5",
    marque: "DFSK",
    name: "E5",
    year: "2027",
    wrote: "ar",
    authorized: true,
    frames: f("dfsk-e5", 2, 2, 2, 2),
    postUrl: post("DbdVP5pjMqh"),
  },
  {
    id: "byd-tang",
    marque: "BYD",
    name: "Tang DM-i",
    wrote: "en",
    authorized: false,
    figure: { value: "7", unit: "", key: "seats" },
    frames: f("byd-tang", 2, 2, 3, 1),
    postUrl: post("DbV-nQlDO1k"),
  },
  {
    id: "byd-sealion-06",
    marque: "BYD",
    name: "Sealion 06 DM-i",
    year: "2026",
    wrote: "en",
    authorized: false,
    frames: f("byd-sealion-06", 2, 2, 2, 2),
    postUrl: post("DbQunM5DGwH"),
  },
  {
    id: "im6",
    marque: "IM Motors",
    name: "IM6",
    year: "2026",
    wrote: "en",
    authorized: true,
    frames: f("im6", 3, 1, 3, 1),
    postUrl: post("DbGZifwjOag"),
  },
  {
    id: "arcfox-t5",
    marque: "ARCFOX",
    name: "T5",
    wrote: "en",
    authorized: true,
    frames: f("arcfox-t5", 3, 1, 3, 1),
    postUrl: post("Da70Y-NjAvu"),
  },
  {
    id: "lynk-co-900",
    marque: "Lynk & Co",
    name: "900",
    year: "2026",
    wrote: "en",
    authorized: false,
    frames: f("lynk-co-900", 2, 2, 3, 1),
    postUrl: post("Da1DmYnDHqg"),
  },
  {
    id: "im-ls7",
    marque: "IM Motors",
    name: "LS7",
    wrote: "en",
    authorized: true,
    figure: { value: "570", unit: "HP", key: "power" },
    frames: f("im-ls7", 2, 1, 3, 1),
    postUrl: post("Dann2K5jFVz"),
  },
];

/**
 * The eight marques their bio names as authorized franchises, in their order.
 * Four of them (Zeekr, Geely, Baic, Fiat) have no car in the last forty posts,
 * so they appear as names only — there is no photograph to attach.
 */
export const MARQUES = [
  "Rox",
  "Zeekr",
  "IM Motors",
  "DFSK",
  "Geely",
  "Baic",
  "Fiat",
  "Arcfox",
] as const;

export const EVENTS = [
  { id: "auto-center-point", postUrl: post("Db52m_ntYCw") },
  { id: "green-friday", postUrl: post("DcaL27Rs87B") },
] as const;

export const HERO_FRAME = "/media/hero-wide.jpg";
/** The same crop at phone width — the mobile hero band is landscape too,
 *  so it only needs fewer pixels, not a different framing. */
export const HERO_FRAME_SM = "/media/hero-wide-sm.jpg";
export const PLATE_WIDE = "/media/plate-wide.jpg";

export const PROFILE = {
  instagram: "https://www.instagram.com/phantomauto.egypt/",
  links: "https://linktr.ee/phantomautoeg",
  maps: "https://www.google.com/maps/search/?api=1&query=Phantom+Auto+Chillout+Gardenia+Suez+Road+Cairo",
  phone: "01080888329",
  phoneHref: "tel:+201080888329",
} as const;
