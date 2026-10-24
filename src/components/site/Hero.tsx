import { useEffect, useRef } from "react";
import { DISHES, SITE } from "@/lib/site";
import { hero, img } from "@/lib/media";
import { gsap, ScrollTrigger, reducedMotion, scrollToY } from "@/lib/motion";
import { HandiMark } from "./HandiMark";

const pad = (n: number) => String(n).padStart(2, "0");

export function Hero({ onFirstReady }: { onFirstReady: () => void }) {
  const root = useRef<HTMLElement>(null);
  const goto = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    const el = root.current!;
    const mob = window.innerWidth < 900;
    const reduce = reducedMotion();
    const q = <T extends Element>(s: string) => Array.from(el.querySelectorAll<T>(s));
    const vids = q<HTMLVideoElement>(".hc-video");
    const clips = q<HTMLElement>(".hero-clip");
    const copies = q<HTMLElement>(".hero-copy");
    const words = q<HTMLElement>(".hero-word");
    const idxItems = q<HTMLElement>(".hero-index li");
    const counter = el.querySelector<HTMLElement>(".hero-count-roll")!;
    const bar = el.querySelector<HTMLElement>(".hero-bar i")!;
    const arch = el.querySelector<HTMLElement>(".hero-arch")!;
    const ready = vids.map(() => false);
    const times = vids.map(() => 0);
    const targets = vids.map(() => 0);
    const urls: string[] = [];
    let cancelled = false;
    let cur = -1;

    // ---- blob loading: every seek is local ----
    async function load(i: number) {
      const v = vids[i];
      try {
        const res = await fetch(hero(DISHES[i].key, mob));
        const blob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        await new Promise<void>((resolve) => {
          v.addEventListener("loadeddata", () => resolve(), { once: true });
          v.addEventListener("error", () => resolve(), { once: true });
          v.src = url;
          v.load();
        });
        try { await v.play(); v.pause(); } catch { /* iOS priming best effort */ }
        v.currentTime = times[i];
        await new Promise<void>((r) => (v.seeking ? v.addEventListener("seeked", () => r(), { once: true }) : r()));
        ready[i] = true;
        v.classList.add("is-ready");
      } catch { /* poster stays visible */ }
    }
    (async () => {
      await load(0);
      if (!cancelled) onFirstReady();
      for (let i = 1; i < vids.length && !cancelled; i++) await load(i);
    })();

    const ctx = gsap.context(() => {
      gsap.set(clips, { autoAlpha: 0 });
      gsap.set(copies, { autoAlpha: 0 });
      words.forEach((w) => gsap.set(w.children, { yPercent: 110 }));

      const swap = (prev: number, i: number, dir: number) => {
        const k = reduce ? 0 : 1;
        if (prev >= 0) {
          gsap.to(clips[prev], { yPercent: -10 * dir, scale: 0.86, filter: "blur(14px)", autoAlpha: 0, duration: 0.7 * k, ease: "power2.in", overwrite: true });
          gsap.to(words[prev].children, { yPercent: -110 * dir, duration: 0.5 * k, stagger: 0.025 * k, ease: "power3.in", overwrite: true });
          gsap.to(copies[prev].querySelectorAll(".ln > span"), { yPercent: -110 * dir, duration: 0.45 * k, stagger: 0.03 * k, ease: "power3.in", overwrite: true });
          gsap.to(copies[prev], { autoAlpha: 0, duration: 0.2 * k, delay: 0.4 * k, overwrite: true });
        }
        gsap.fromTo(clips[i], { yPercent: 10 * dir, scale: 1.18, filter: "blur(16px)", autoAlpha: 0 },
          { yPercent: 0, scale: 1, filter: "blur(0px)", autoAlpha: 1, duration: 1.2 * k, ease: "expo.out", overwrite: true });
        gsap.fromTo(words[i].children, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.9 * k, stagger: 0.035 * k, ease: "expo.out", delay: 0.15 * k, overwrite: true });
        gsap.set(copies[i], { autoAlpha: 1, overwrite: true });
        gsap.fromTo(copies[i].querySelectorAll(".ln > span"), { yPercent: 110 * dir }, { yPercent: 0, duration: 0.9 * k, stagger: 0.06 * k, ease: "expo.out", delay: 0.2 * k, overwrite: true });
        gsap.to(el, { "--accent": DISHES[i].accent, duration: 0.8 * k });
        gsap.to(counter, { yPercent: -100 * i / DISHES.length, duration: 0.7 * k, ease: "expo.out" });
        idxItems.forEach((li, n) => li.classList.toggle("is-active", n === i));
      };

      const update = (p: number) => {
        const f = Math.min(p * DISHES.length, DISHES.length - 0.0001);
        const i = Math.floor(f);
        const local = f - i;
        const d = vids[i].duration || 6;
        targets[i] = local * (d - 0.05);
        if (i !== cur) {
          const prev = cur;
          cur = i;
          times[i] = targets[i];
          if (ready[i]) vids[i].currentTime = times[i];
          swap(prev, i, prev < 0 || i > prev ? 1 : -1);
        }
        gsap.set(bar, { scaleX: p });
      };

      const band = () => (window.innerWidth < 900 ? 0.9 : 1.05) * window.innerHeight;
      const st = ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: () => "+=" + band() * DISHES.length,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (s) => update(s.progress),
      });
      update(0);
      goto.current = (i) => scrollToY(st.start + ((i + 0.5) / DISHES.length) * (st.end - st.start));

      const tick = () => {
        if (cur < 0) return;
        const v = vids[cur];
        times[cur] += (targets[cur] - times[cur]) * (reduce ? 1 : 0.2);
        if (ready[cur] && !v.seeking && Math.abs(v.currentTime - times[cur]) > 0.008) v.currentTime = times[cur];
      };
      gsap.ticker.add(tick);

      // arch leans toward the cursor
      const onMove = (e: MouseEvent) => {
        if (reduce) return;
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        gsap.to(arch, { rotationY: x * 10, rotationX: -y * 8, duration: 0.9, ease: "power3.out" });
      };
      el.addEventListener("mousemove", onMove);
      return () => { gsap.ticker.remove(tick); el.removeEventListener("mousemove", onMove); };
    }, el);

    return () => {
      cancelled = true;
      ctx.revert();
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [onFirstReady]);

  return (
    <section className="hero" ref={root} id="top">
      <div className="hero-glow" />
      <div className="hero-words" aria-hidden>
        {DISHES.map((d) => (
          <div className="hero-word" key={d.key}>
            {d.word.split("").map((c, i) => <span key={i}>{c}</span>)}
          </div>
        ))}
      </div>

      <div className="hero-stage">
        <div className="hero-arch" data-cursor="Taste">
          {DISHES.map((d) => (
            <div className="hero-clip" key={d.key}>
              <img src={img(d.img)} alt="" className="hc-poster" />
              <video className="hc-video" muted playsInline preload="none" aria-label={`${d.t1} ${d.t2}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="hero-copies">
        {DISHES.map((d, i) => (
          <div className="hero-copy" key={d.key}>
            <p className="eyebrow ln"><span>{pad(i + 1)} · {d.cat} <em className="hindi">{d.hindi}</em></span></p>
            <h1 className="hero-title">
              <span className="ln"><span>{d.t1}</span></span>
              <span className="ln"><span><em>{d.t2}</em></span></span>
            </h1>
            <p className="hero-desc ln"><span>{d.desc}</span></p>
            <p className="hero-price ln"><span>{d.price}</span></p>
          </div>
        ))}
      </div>

      <ol className="hero-index">
        {DISHES.map((d, i) => (
          <li key={d.key}>
            <button onClick={() => goto.current(i)} className="mono">
              <span>{pad(i + 1)}</span> {d.t1} {d.t2}
            </button>
          </li>
        ))}
      </ol>

      <div className="hero-count mono">
        <span className="hero-count-win"><span className="hero-count-roll">{DISHES.map((_, i) => <span key={i}>{pad(i + 1)}</span>)}</span></span>
        <span className="muted">/ {pad(DISHES.length)}</span>
      </div>
      <div className="hero-bar"><i /></div>

      <div className="ring-badge" aria-hidden>
        <svg viewBox="0 0 200 200">
          <defs><path id="ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs>
          <text><textPath href="#ring">{`${SITE.name.toUpperCase()} ✦ HYDERABADI DUM BIRYANI ✦ ${SITE.city.toUpperCase()} ✦ `}</textPath></text>
        </svg>
        <HandiMark className="ring-handi" />
      </div>
      <p className="hero-hint mono">Scroll to serve ↓</p>
    </section>
  );
}
