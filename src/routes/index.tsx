import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, scroller, reducedMotion } from "@/lib/motion";
import { Hero } from "@/components/site/Hero";
import { Cursor, Grain, Loader, Nav } from "@/components/site/Chrome";
import { Footer, Manifesto, MaskWord, Marquee, Menu, Pour, Rules, Spices, Steps, Tandoor, Visit, useLineReveals } from "@/components/site/Sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mr. Biriyaniwala — Hyderabadi dum biryani & charcoal tandoor, Adelaide" },
      { name: "description", content: "Biryani sealed with dough and slow-cooked on dum for ninety minutes, opened at your table. Charcoal tandoor, eleven spices, Adelaide." },
      { property: "og:title", content: "Mr. Biriyaniwala — Hyderabadi dum biryani, Adelaide" },
      { property: "og:description", content: "Sealed in copper, cooked on dum, opened at the table." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const onFirst = useCallback(() => setReady(true), []);
  useLineReveals();

  useEffect(() => {
    // fonts + first hero clip gate the loader, capped at 4.5s
    const cap = setTimeout(() => setReady(true), 4500);
    let lenis: Lenis | null = null;
    if (!reducedMotion()) {
      lenis = new Lenis({ lerp: 0.1 });
      scroller.lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (t: number) => lenis!.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
      return () => { clearTimeout(cap); gsap.ticker.remove(raf); lenis!.destroy(); scroller.lenis = null; };
    }
    return () => clearTimeout(cap);
  }, []);

  const [fontsOk, setFontsOk] = useState(false);
  useEffect(() => { document.fonts?.ready.then(() => { setFontsOk(true); ScrollTrigger.refresh(); }); }, []);

  const onDone = useCallback(() => {
    setLoaded(true);
    scroller.lenis?.start();
    ScrollTrigger.refresh();
  }, []);

  return (
    <main className={loaded ? "is-loaded" : "is-loading"}>
      <Loader ready={ready && fontsOk} onDone={onDone} />
      <Grain />
      <Cursor />
      <Nav />
      <Hero onFirstReady={onFirst} />
      <Marquee />
      <Manifesto />
      <Steps />
      <MaskWord />
      <Spices />
      <Menu />
      <Tandoor />
      <Pour />
      <Rules />
      <Visit />
      <Footer />
    </main>
  );
}
