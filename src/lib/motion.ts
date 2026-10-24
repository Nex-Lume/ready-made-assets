import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

export const scroller: { lenis: Lenis | null } = { lenis: null };

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function scrollToY(y: number) {
  if (scroller.lenis) scroller.lenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: reducedMotion() ? "auto" : "smooth" });
}

export function scrollToSel(sel: string) {
  const el = document.querySelector(sel);
  if (!el) return;
  scrollToY(el.getBoundingClientRect().top + window.scrollY);
}
