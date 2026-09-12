import type { PhantomContent } from "./schema-ext";
import { PROFILE } from "./media";

export const en: PhantomContent = {
  locale: "en",
  dir: "ltr",

  brand: {
    name: "Phantom Auto",
    shortName: "Phantom",
    // Their own hashtag, on every post they publish.
    tagline: "Drive your dream",
  },

  nav: [
    { label: "Marques", href: "#marques" },
    { label: "Fleet", href: "#fleet" },
    { label: "Figures", href: "#figures" },
    { label: "Shows", href: "#shows" },
    { label: "Showroom", href: "#showroom" },
  ],

  hero: {
    eyebrow: "Authorized dealers",
    headline: "Drive your dream",
    sub: "Rox, Zeekr, IM Motors, DFSK, Geely, Baic, Fiat and Arcfox — authorized. Thirteen of their cars, every one of them photographed on the same stretch of the Suez road at dusk.",
    primaryCta: "Call the showroom",
    secondaryCta: "See the fleet",
    headlineLead: 'Drive your',
    headlineAccent: 'dream',
    canvasHint: "Drag across the frame to push the current.",
    canvasAlt:
      "An IM5 in dark paint on the Suez road at dusk, backlit through palms, from Phantom Auto's own feed.",
    marqueeLabel: "New energy · New Cairo · Suez road",
  },

  about: {
    heading: "Phantom Auto",
    body: [
      "Phantom Auto is a verified new-energy dealership on the Suez road, east of Cairo. Their bio names eight marques they are authorized to sell, and their feed is one long, unbroken run of the same shoot: a car on the same asphalt, the same green verge, the same palms, the same half-hour of light.",
      "That consistency is the whole identity. Nothing here is a stock render — every frame on this page is theirs.",
    ],
  },

  services: {
    heading: "Marques",
    items: [],
  },

  gallery: {
    heading: "Fleet",
    items: [],
  },

  marques: {
    eyebrow: "Franchises",
    heading: "Eight marques, authorized",
    intro: "The franchises their profile names, in their order.",
    note: "Four of the eight have no car in their last forty posts, so they are listed here as names only — there is no photograph of one to show.",
    hasCars: "In the feed",
    listedOnly: "Listed in their bio",
    alsoHeading: "And four more on the floor",
    alsoNote:
      "BYD, Lynk & Co, Changan and DEEPAL all appear in their last forty posts without being named in the bio. Their captions call those cars \u201Cavailable now at Phantom Auto\u201D rather than claiming a franchise, and this page keeps that distinction.",
  },

  fleet: {
    eyebrow: "The fleet",
    heading: "Thirteen cars, one road",
    intro:
      "Every model Phantom Auto photographed across their last forty posts. The line under each name is the line they wrote for that car, and the badge only appears where their own caption says so.",
    barHint: "Drag the bar, or use the arrow keys.",
    barLabel: "Select a model",
    position: "Model {n} of {total}",
    authorized: "Authorized dealer",
    available: "Available now at Phantom Auto",
    theirWords: "In their words",
    translatedFrom: "Translated from their Arabic caption",
    viewPost: "See the original post",
    roles: {
      ext: "Exterior",
      rear: "Light bar",
      int: "Cabin",
      det: "Detail",
    },
    figureLabels: {
      range: "Total range",
      power: "Power",
      seats: "Seats",
    },
    lines: {
      "changan-q05":
        "A style that turns heads, and technology that makes every trip better.",
      "deepal-g318": "Where bold design meets serious capability.",
      "dfsk-e5-plus":
        "More space. Smarter technology. And a better drive.",
      im5: "Pure design. Intelligent performance.",
      "rox-adamas": "Every journey deserves a bold statement.",
      "byd-han-l":
        "Experience the all-new BYD Han L DM-i. Total range 1400 KM.",
      "dfsk-e5": "Everything you need — in one car.",
      "byd-tang":
        "7 seats. More comfort. More adventure. The perfect SUV for every journey.",
      "byd-sealion-06":
        "Where intelligent technology meets bold design and efficient performance.",
      im6: "Innovation in every detail.",
      "arcfox-t5":
        "Intelligent technology, premium comfort, and all-electric performance in one exceptional SUV.",
      "lynk-co-900":
        "Bold design, intelligent technology, and exceptional comfort in one flagship SUV.",
      "im-ls7": "Experience 570 HP of electric excellence.",
    },
    altPrefix: "at Phantom Auto",
  },

  figures: {
    eyebrow: "On the record",
    heading: "The figures they published",
    intro: "Four numbers, each one lifted from the caption that carried it.",
    cells: [
      { value: "8", unit: "", label: "Marques authorized", source: "Their bio" },
      { value: "1400", unit: "KM", label: "Total range, BYD Han L DM-i", source: "3 Aug post" },
      { value: "570", unit: "HP", label: "IM LS7, all-electric", source: "10 Jul post" },
      { value: "7", unit: "", label: "Seats, BYD Tang DM-i", source: "28 Jul post" },
    ],
  },

  claim: {
    quote:
      "Phantom Auto affirms its established leadership in the smart automotive sector, and continues its pivotal role in enabling Egypt's transition toward a cleaner, smarter and more sustainable mobility future.",
    attribution: "Phantom Auto, announcing their Green Friday Market sponsorship",
  },

  events: {
    eyebrow: "Sponsorships",
    heading: "Where they show",
    intro: "Two sponsorships they announced on their own feed.",
    labels: { dates: "Dates", venue: "Venue", stand: "Stand" },
    items: [
      {
        id: "auto-center-point",
        title: "Auto Center Point, 5th edition",
        role: "Official showroom sponsor",
        dates: "9–12 September 2026",
        venue: "Axis Mall, Suez Road",
        detail: "Booth A5, A6",
        alt: "Phantom Auto's Auto Center Point sponsor announcement.",
      },
      {
        id: "green-friday",
        title: "Green Friday Market 2026",
        role: "Platinum sponsor",
        dates: "8–9 October 2026",
        venue: "Al Masa Hotel, Nasr City",
        alt: "Phantom Auto's Green Friday Market platinum sponsor announcement.",
      },
    ],
    viewPost: "See the announcement",
  },

  showroom: {
    eyebrow: "Visit",
    heading: "The showroom",
    body: [
      "The same stretch of road runs through every frame on this page.",
    ],
    directionsCta: "Open in Maps",
    instagramCta: "Instagram",
    linksCta: "All their links",
  },

  contact: {
    heading: "Visit",
    addressLabel: "Showroom",
    address: "A1 — Chillout Gardenia — Suez Road",
    phoneLabel: "Call us",
    phones: [PROFILE.phone],
    mapsUrl: PROFILE.maps,
    instagramUrl: PROFILE.instagram,
    cta: "Call the showroom",
  },

  footer: {
    rights: "© Phantom Auto. All rights reserved.",
  },

  a11y: {
    toggleLanguage: "التبديل إلى العربية",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
};
