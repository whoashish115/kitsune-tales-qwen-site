import { Hero } from "@/components/hero";
import { Footer, Resources, Samples } from "@/components/more";
import { Nav } from "@/components/nav";
import { Results } from "@/components/results";
import { DataSection, ModelSection, Training } from "@/components/sections";

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <ModelSection />
        <DataSection />
        <Training />
        <Results />
        <Samples />
        <Resources />
        <Footer />
      </main>
    </>
  );
}
