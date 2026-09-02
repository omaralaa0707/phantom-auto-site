import type { SiteContent } from "@/i18n/schema";
import { useContent } from "@/i18n/locale-provider";
import type { FrameRole } from "./media";

/**
 * Phantom Auto are a franchise dealer, not a used-car collector, so this site
 * needs a vocabulary the shared schema does not carry: marque authorisation,
 * a per-model line quoted from that model's own post, and the two motor shows
 * they announced sponsoring.
 */
export type PhantomContent = SiteContent & {
  hero: SiteContent["hero"] & {
    /** The headline, split so the last word can carry the tail-light red. */
    headlineLead: string;
    headlineAccent: string;
    /** One line telling the visitor the hero canvas responds to the pointer. */
    canvasHint: string;
    /** Alt text for the static fallback when WebGL is unavailable. */
    canvasAlt: string;
    marqueeLabel: string;
  };
  marques: {
    eyebrow: string;
    heading: string;
    intro: string;
    /** Explains why four of the eight have no car attached. */
    note: string;
    hasCars: string;
    listedOnly: string;
    /** Marques whose cars are in the feed but which the bio does not name. */
    alsoHeading: string;
    alsoNote: string;
  };
  fleet: {
    eyebrow: string;
    heading: string;
    intro: string;
    /** Instruction for the tail-light-bar selector. */
    barHint: string;
    barLabel: string;
    position: string;
    authorized: string;
    available: string;
    theirWords: string;
    translatedFrom: string;
    viewPost: string;
    roles: Record<FrameRole, string>;
    figureLabels: Record<"range" | "power" | "seats", string>;
    /** Their line for each car, keyed by model id. */
    lines: Record<string, string>;
    /** Alt text for each car, keyed by model id then role. */
    altPrefix: string;
  };
  figures: {
    eyebrow: string;
    heading: string;
    intro: string;
    cells: { value: string; unit: string; label: string; source: string }[];
  };
  claim: {
    quote: string;
    attribution: string;
  };
  events: {
    eyebrow: string;
    heading: string;
    intro: string;
    labels: { dates: string; venue: string; stand: string };
    items: {
      id: string;
      title: string;
      role: string;
      dates: string;
      venue: string;
      detail?: string;
      alt: string;
    }[];
    viewPost: string;
  };
  showroom: {
    eyebrow: string;
    heading: string;
    body: string[];
    directionsCta: string;
    instagramCta: string;
    linksCta: string;
  };
};

export function usePhantom() {
  return useContent() as PhantomContent;
}
