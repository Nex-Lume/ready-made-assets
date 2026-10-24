import { useEffect, useRef, useState } from "react";
import { SITE, openStatus } from "@/lib/site";
import { film, poster } from "@/lib/media";
import { gsap, scroller, scrollToSel, reducedMotion } from "@/lib/motion";
import { HandiMark } from "./HandiMark";
import { cn } from "@/lib/utils";

/* ---------- Film: plays only near the viewport ---------- */
export function Film({ k, className, cursor }: { k: string; className?: string; cursor?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current!;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { rootMargin: "150px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className={cn("film", className)} src={film(k)} poster={poster(k)} muted loop playsInline preload="metadata" data-cursor={cursor} />;
}

/* ---------- Loader ---------- */
const MSGS = ["Sealing the handi with dough", "Slow-cooking on dum", "Lifting the lid"];
export function Loader({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [n, setN] = useState(0);
  const el = useRef<HTMLDivElement>(null);
  const val = useRef({ v: 0 });
  const done = useRef(false);
  useEffect(() => {
    const t = gsap.to(val.current, { v: 88, duration: 3.2, ease: "power2.out", onUpdate: () => setN(Math.round(val.current.v)) });
    return () => { t.kill(); };
  }, []);
  useEffect(() => {
    if (!ready || done.current) return;
    done.current = true;
    gsap.to(val.current, {
      v: 100, duration: 0.5, ease: "power2.out", onUpdate: () => setN(Math.round(val.current.v)),
      onComplete: () => {
        const tl = gsap.timeline({ onComplete: onDone });
        tl.to(el.current!.querySelector(".loader-inner"), { autoAlpha: 0, duration: 0.3 })
          .to(el.current!.querySelector(".loader-top"), { yPercent: -100, duration: 1, ease: "expo.inOut" }, "<0.1")
          .to(el.current!.querySelector(".loader-bot"), { yPercent: 100, duration: 1, ease: "expo.inOut" }, "<")
          .set(el.current, { display: "none" });
      },
    });
  }, [ready, onDone]);
  const msg = MSGS[n < 40 ? 0 : n < 85 ? 1 : 2];
  return (
    <div className="loader" ref={el} aria-live="polite">
      <div className="loader-top" /><div className="loader-bot" />
      <div className="loader-inner">
        <HandiMark className="loader-handi" steam />
        <div className="loader-count mono">{String(n).padStart(3, "0")}</div>
        <div className="loader-bar"><i style={{ transform: `scaleX(${n / 100})` }} /></div>
        <p className="mono loader-msg">{msg}</p>
      </div>
    </div>
  );
}

/* ---------- Open status ---------- */
export function useOpenStatus() {
  const [s, setS] = useState<{ open: boolean; label: string } | null>(null);
  useEffect(() => {
    const f = () => setS(openStatus(new Date()));
    f();
    const id = setInterval(f, 30000);
    return () => clearInterval(id);
  }, []);
  return s;
}

/* ---------- Nav ---------- */
const LINKS = [["The Dum", "#dum"], ["Spices", "#spices"], ["Menu", "#menu"], ["Tandoor", "#tandoor"], ["Visit", "#visit"]];
export function Nav() {
  const status = useOpenStatus();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    const f = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 200);
      last = y;
    };
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const go = (h: string) => { setOpen(false); scrollToSel(h); };
  return (
    <>
      <header className={cn("nav", hidden && !open && "is-hidden")}>
        <button className="nav-brand" onClick={() => go("#top")} aria-label="Back to top">
          <HandiMark className="nav-mark" />
          <span>{SITE.nameA}<b>{SITE.nameB}</b></span>
        </button>
        <nav className="nav-links">
          {LINKS.map(([l, h]) => (
            <button key={h} className="roll" data-text={l} onClick={() => go(h)}><span>{l}</span></button>
          ))}
        </nav>
        <div className="nav-right">
          {status && <span className={cn("pill mono", status.open ? "is-open" : "is-closed")}><i />{status.label}</span>}
          <a className="btn btn-primary" data-magnetic href={SITE.phoneHref}>Call to order</a>
          <button className={cn("burger", open && "is-open")} onClick={() => setOpen(!open)} aria-label="Menu"><i /><i /></button>
        </div>
      </header>
      <div className={cn("overlay-menu", open && "is-open")}>
        {LINKS.map(([l, h], i) => (
          <button key={h} onClick={() => go(h)} style={{ transitionDelay: `${open ? 0.1 + i * 0.05 : 0}s` }}>
            <span className="mono">0{i + 1}</span>{l}
          </button>
        ))}
        <a className="mono" href={SITE.phoneHref}>{SITE.phone}</a>
      </div>
    </>
  );
}

/* ---------- Cursor + magnetic ---------- */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.1 }), dy = gsap.quickTo(dot.current, "y", { duration: 0.1 });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    const move = (e: MouseEvent) => {
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
      const t = (e.target as Element).closest?.("[data-cursor]");
      setLabel(t ? t.getAttribute("data-cursor") || "" : "");
      ring.current!.classList.toggle("is-link", !!(e.target as Element).closest?.("a,button"));
      const m = (e.target as Element).closest?.("[data-magnetic]") as HTMLElement | null;
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((b) => {
        if (b !== m) gsap.to(b, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
      });
      if (m && !reducedMotion()) {
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 });
      }
    };
    window.addEventListener("mousemove", move);
    return () => { window.removeEventListener("mousemove", move); document.documentElement.classList.remove("has-cursor"); };
  }, []);
  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className={cn("cursor-ring", label && "has-label")} ref={ring}><span>{label}</span></div>
    </>
  );
}

export function Grain() {
  return <div className="grain" aria-hidden />;
}

export { scroller };
