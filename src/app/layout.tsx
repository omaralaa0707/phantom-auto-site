import type { Metadata } from "next";
import { Sora, Be_Vietnam_Pro, Changa } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/i18n/locale-provider";
import { ar } from "@/content/ar";
import { en } from "@/content/en";

// Their wordmark is a hard geometric caps setting with cut corners; Sora is
// the closest face with the same squared-off, new-mobility temperament.
const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
});
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-bevietnam",
});
// Changa's angular Arabic carries the same cut-corner temperament as the
// Latin display face, so the two locales read as one identity.
const changa = Changa({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-changa",
});

export const metadata: Metadata = {
  title: "Phantom Auto — Drive your dream | New-energy dealership, Suez Road",
  description:
    "Authorized dealers for Rox, Zeekr, IM Motors, DFSK, Geely, Baic, Fiat and Arcfox. Thirteen new-energy cars, photographed on one stretch of the Suez road at dusk.",
  metadataBase: new URL("https://phantom-auto-site.vercel.app"),
  icons: { icon: "/mark.svg" },
  openGraph: {
    title: "Phantom Auto — Drive your dream",
    description:
      "A new-energy dealership on the Suez road: eight authorized marques, thirteen cars, one road.",
    images: ["/media/hero-wide.jpg"],
    locale: "ar_EG",
    type: "website",
  },
  other: { "theme-color": "#e8ecee" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // translate="no": the page ships hand-written Arabic and English, and
    // Chrome's auto-translate rewrites `lang`, which would also break every
    // [dir="rtl"] correction if the CSS were keyed off language instead.
    <html
      lang="ar"
      dir="rtl"
      translate="no"
      className={`notranslate ${sora.variable} ${beVietnam.variable} ${changa.variable}`}
    >
      <body className="bg-haze text-ink antialiased">
        {/* Sections arrive with an intersection observer, so without scripting
            every one of them would stay at opacity 0. */}
        <noscript>
          <style>{`[data-surge],[data-bar]{opacity:1!important;transform:none!important;animation:none!important}`}</style>
        </noscript>
        <LocaleProvider dictionaries={{ ar, en }} defaultLocale="ar">
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
