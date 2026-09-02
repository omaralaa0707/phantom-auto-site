import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { Marques } from "@/components/site/marques";
import { Fleet } from "@/components/site/fleet";
import { Figures } from "@/components/site/figures";
import { Shows } from "@/components/site/shows";
import { Showroom, Footer } from "@/components/site/showroom";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marques />
        <Fleet />
        <Figures />
        <Shows />
        <Showroom />
      </main>
      <Footer />
    </>
  );
}
