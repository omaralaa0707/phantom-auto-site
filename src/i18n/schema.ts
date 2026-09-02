export type Locale = "ar" | "en";

export type NavLink = { label: string; href: string };

export type GalleryItem = {
  /** Path under /public, e.g. "/media/cars/01.jpg" */
  src: string;
  alt: string;
  /** Optional short caption drawn from the dealership's own post copy. */
  caption?: string;
  /** Set for video sources so galleries can branch on media type. */
  kind?: "image" | "video";
};

export type ServiceItem = {
  title: string;
  body: string;
};

export type StatItem = {
  value: string;
  label: string;
};

/**
 * One dealership's full page copy in a single locale. Every site fills the same
 * shape so content sourcing stays mechanical while layout stays bespoke.
 */
export type SiteContent = {
  locale: Locale;
  dir: "rtl" | "ltr";
  brand: {
    name: string;
    /** Short mark/wordmark text used where the logo image is not appropriate. */
    shortName: string;
    tagline: string;
  };
  nav: NavLink[];
  hero: {
    eyebrow?: string;
    headline: string;
    sub: string;
    primaryCta: string;
    secondaryCta: string;
  };
  about: {
    heading: string;
    body: string[];
    stats?: StatItem[];
  };
  services: {
    heading: string;
    intro?: string;
    items: ServiceItem[];
  };
  gallery: {
    heading: string;
    intro?: string;
    items: GalleryItem[];
  };
  contact: {
    heading: string;
    intro?: string;
    addressLabel: string;
    address: string;
    phoneLabel: string;
    phones: string[];
    hoursLabel?: string;
    hours?: string;
    mapsUrl: string;
    instagramUrl?: string;
    facebookUrl?: string;
    cta: string;
  };
  footer: {
    /** Bilingual disclaimer: these are concept sites, not official ones. */
    disclaimer: string;
    rights: string;
  };
  a11y: {
    toggleLanguage: string;
    openMenu: string;
    closeMenu: string;
  };
};
