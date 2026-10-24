import { Fragment, useEffect, useRef, useState } from "react";
import { DISHES, MENU, RULES, SITE, SPICES } from "@/lib/site";
import { film, img } from "@/lib/media";
import { gsap, ScrollTrigger, reducedMotion, scrollToSel } from "@/lib/motion";
import { Film, useOpenStatus } from "./Chrome";
import { cn } from "@/lib/utils";

const pad = (n: number) => String(n).padStart(2, "0");

function useGsap(fn: (el: HTMLElement, reduce: boolean) => void | (() => void)) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    let cleanup: void | (() => void);
    const ctx = gsap.context(() => { cleanup = fn(el, reducedMotion()); }, el);
    return () => { cleanup?.(); ctx.revert(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

/** Headline split into masked lines. Wrap the emphasised word in <em>. */
function Lines({ as: Tag = "h2", lines, className }: { as?: "h2" | "h3" | "p"; lines: React.ReactNode[]; className?: string }) {
  return <Tag className={cn("split", className)}>{lines.map((l, i) => <span className="ln" key={i}><span>{l}</span></span>)}</Tag>;
}

function Eyebrow({ n, label, hi }: { n: string; label: string; hi?: string }) {
  return <p className="eyebrow"><span>{n}</span> {label} {hi && <em className="hindi">{hi}</em>}</p>;
}

/* ---------- Marquee ---------- */
export function Marquee() {
  const ref = useGsap((el, reduce) => {
    if (reduce) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>(".mq-track"));
    const tws = rows.map((r, i) => gsap.fromTo(r, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: 28, ease: "none", repeat: -1 }));
    const skew = gsap.quickTo(el, "skewY", { duration: 0.5 });
    ScrollTrigger.create({
      trigger: el, start: "top bottom", end: "bottom top",
      onUpdate: (s) => {
        const v = s.getVelocity();
        tws.forEach((t) => gsap.to(t, { timeScale: 1 + Math.min(Math.abs(v) / 300, 6), duration: 0.2, overwrite: true, onComplete: () => { gsap.to(t, { timeScale: 1, duration: 1 }); } }));
        skew(gsap.utils.clamp(-4, 4, v / -400));
      },
    });
  });
  const a = ["Dum Pukht", "Saffron", "Sealed in Copper", "बिरयानी", "Ninety Minutes", "Charcoal", "केसर"];
  const b = ["Tandoor 480°C", "Hand-pulled Naan", "दम", "Eleven Spices", "Ghee", "Adelaide", "खुशबू"];
  const row = (w: string[]) => [...w, ...w].map((x, i) => <Fragment key={i}><span className={/[\u0900-\u097F]/.test(x) ? "hindi" : ""}>{x}</span><i>✦</i></Fragment>);
  return (
    <section className="marquee" ref={ref} aria-hidden>
      <div className="mq-row"><div className="mq-track">{row(a)}</div></div>
      <div className="mq-row mq-alt"><div className="mq-track">{row(b)}</div></div>
    </section>
  );
}

/* ---------- 01 Manifesto ---------- */
const MANI: (string | { pill: string })[] = [
  "We", "don't", "rush", "rice.", "Every", "handi", "is", "layered", "by", "hand,", { pill: "tandoori" }, "sealed", "with", "a", "rope", "of", "dough", "and", "left", "on", "dum", "for", "ninety", "minutes,", "until", "the", { pill: "spices" }, "saffron,", "the", "ghee", "and", "the", "meat", "agree", "on", "everything.", "Then", "we", "carry", "it", "out", "and", "break", "the", "seal", { pill: "steam" }, "at", "your", "table.",
];
export function Manifesto() {
  const ref = useGsap((el, reduce) => {
    if (reduce) return;
    const items = el.querySelectorAll(".mw, .mpill");
    const tl = gsap.timeline({ scrollTrigger: { trigger: el.querySelector(".mani-text"), start: "top 75%", end: "bottom 45%", scrub: 0.6 } });
    items.forEach((it, i) => {
      if (it.classList.contains("mpill")) tl.fromTo(it, { width: 0 }, { width: "2.4em", duration: 2, ease: "power2.out" }, i * 0.4 - 1);
      else tl.fromTo(it, { opacity: 0.14 }, { opacity: 1, duration: 0.6 }, i * 0.4);
    });
  });
  return (
    <section className="section mani" id="dum" ref={ref}>
      <Eyebrow n="01" label="The Dum" hi="दम" />
      <p className="mani-text">
        {MANI.map((w, i) => typeof w === "string"
          ? <span className="mw" key={i}>{w} </span>
          : <span className="mpill" key={i} data-cursor="Look"><video src={film(w.pill)} muted loop autoPlay playsInline /></span>)}
      </p>
    </section>
  );
}

/* ---------- 02 Five steps ---------- */
const STEPS = [
  { t: "Marinate", hi: "मसाला", n: "12 hrs", d: "Yoghurt, fried onion, green chilli and our eleven spices. Overnight, always.", m: { img: "tandoori" } },
  { t: "Parboil", hi: "चावल", n: "70%", d: "Aged basmati boiled in salted, spiced water until it is seventy per cent done. Not seventy-one.", m: { film: "steam" } },
  { t: "Layer", hi: "परत", n: "6 layers", d: "Meat, rice, saffron milk, mint, fried onion, ghee. Repeat. Patience is the seventh layer.", m: { film: "ingredients" } },
  { t: "Seal", hi: "दम", n: "90 min", d: "A rope of atta dough locks the lid. The handi goes onto low coals with more coals on top.", m: { img: "handi-dum" } },
  { t: "Lift", hi: "खुशबू", n: "1 breath", d: "We crack the seal at your table. The first breath of steam is the whole point.", m: { film: "biryani" } },
];
export function Steps() {
  const ref = useGsap((el, reduce) => {
    const track = el.querySelector<HTMLElement>(".steps-track")!;
    if (reduce || window.innerWidth < 900) return;
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
    el.querySelectorAll<HTMLElement>(".step-media > *").forEach((m) => {
      gsap.fromTo(m, { xPercent: -12 }, { xPercent: 12, ease: "none", scrollTrigger: { trigger: m.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true } });
    });
  });
  return (
    <section className="steps" ref={ref}>
      <div className="steps-track">
        <div className="steps-intro">
          <Eyebrow n="02" label="Five steps · One lid" />
          <Lines lines={["Ninety minutes", <>you will <em>never</em></>, "see us skip."]} />
        </div>
        {STEPS.map((s, i) => (
          <article className="step" key={s.t}>
            <div className="step-media" data-cursor="Dum">
              {s.m.film ? <Film k={s.m.film} /> : <img src={img(s.m.img!)} alt={s.t} loading="lazy" />}
            </div>
            <div className="step-body">
              <p className="mono step-n">{pad(i + 1)} — {s.n}</p>
              <h3>{s.t} <span className="hindi">{s.hi}</span></h3>
              <p>{s.d}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Mask word ---------- */
export function MaskWord() {
  const ref = useGsap((el, reduce) => {
    const overlay = el.querySelector<HTMLElement>(".mask-overlay")!;
    const letters = el.querySelectorAll(".mask-word span");
    const stem = el.querySelector<HTMLElement>(".mask-word .stem")!;
    if (reduce) return;
    const setOrigin = () => {
      gsap.set(overlay, { scale: 1 });
      const o = overlay.getBoundingClientRect(), r = stem.getBoundingClientRect();
      gsap.set(overlay, { transformOrigin: `${r.left + r.width / 2 - o.left}px ${r.top + r.height * 0.55 - o.top}px` });
    };
    setOrigin();
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6, onRefreshInit: setOrigin } });
    tl.from(letters, { yPercent: 120, stagger: 0.06, duration: 0.6, ease: "power3.out" })
      .to(overlay, { scale: 70, duration: 1.4, ease: "power2.in" }, "+=0.15")
      .to(overlay, { autoAlpha: 0, duration: 0.7 }, "-=0.8")
      .from(el.querySelector(".mask-cap"), { autoAlpha: 0, y: 40, duration: 0.4 });
  });
  return (
    <section className="mask" ref={ref}>
      <div className="mask-sticky">
        <Film k="biryani" className="mask-film" cursor="Taste" />
        <div className="mask-overlay"><h2 className="mask-word" aria-label="Biriyani">{"BIRIYANI".split("").map((c, i) => <span key={i} className={i === 1 ? "stem" : ""}>{c}</span>)}</h2></div>
        <p className="mask-cap">Opened at the table. <em>Never before.</em></p>
      </div>
    </section>
  );
}

/* ---------- 03 Spices ---------- */
const GLYPHS = "अआइकखगघचजटडतदनपबमयरलवशसह*#%&";
function Scramble({ en, hi, onEnter }: { en: string; hi: string; onEnter: () => void }) {
  const [txt, setTxt] = useState(en);
  const timer = useRef<number>(0);
  const run = (to: string) => {
    window.clearInterval(timer.current);
    let f = 0;
    timer.current = window.setInterval(() => {
      f++;
      const p = Math.min(f / 10, 1);
      const n = Math.round(to.length * p);
      setTxt(to.slice(0, n) + Array.from({ length: Math.max(0, Math.ceil(to.length * 0.6) - n) }, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]).join(""));
      if (p >= 1) { window.clearInterval(timer.current); setTxt(to); }
    }, 30);
  };
  useEffect(() => () => window.clearInterval(timer.current), []);
  const isHi = txt !== en && /[\u0900-\u097F]/.test(txt);
  return <span className={cn("spice-name", isHi && "hindi")} onMouseEnter={() => { onEnter(); run(hi); }} onMouseLeave={() => run(en)}>{txt}</span>;
}
export function Spices() {
  const [cur, setCur] = useState(0);
  const ref = useGsap((el) => {
    el.querySelectorAll(".spice-list li").forEach((li, i) => {
      ScrollTrigger.create({ trigger: li, start: "top 55%", end: "bottom 55%", onToggle: (s) => s.isActive && setCur(i) });
    });
  });
  return (
    <section className="section spices" id="spices" ref={ref}>
      <div className="spices-head">
        <Eyebrow n="03" label="In the handi" hi="मसाले" />
        <Lines lines={["Eleven spices.", <><em>Toasted</em> every morning.</>]} />
      </div>
      <div className="spices-grid">
        <div className="spices-sticky">
          <Film k="spices" cursor="Look" />
          <p className="mono spice-count">{pad(cur + 1)} / {SPICES.length} · {SPICES[cur].en}</p>
        </div>
        <ol className="spice-list">
          {SPICES.map((s, i) => (
            <li key={s.en} className={cn(i === cur && "is-active")}>
              <span className="mono">{pad(i + 1)}</span>
              <Scramble en={s.en} hi={s.hi} onEnter={() => setCur(i)} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- 04 Menu ---------- */
export function Menu() {
  const [tab, setTab] = useState(0);
  const thumb = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const ref = useGsap((el) => {
    const t = thumb.current!;
    const qx = gsap.quickTo(t, "x", { duration: 0.5, ease: "power3" }), qy = gsap.quickTo(t, "y", { duration: 0.5, ease: "power3" });
    const mv = (e: MouseEvent) => { qx(e.clientX); qy(e.clientY); };
    el.addEventListener("mousemove", mv);
    return () => el.removeEventListener("mousemove", mv);
  });
  return (
    <section className="section menu" id="menu" ref={ref}>
      <Eyebrow n="04" label="The Menu" hi="खाना" />
      <Lines lines={["Made for the", <><em>whole</em> table.</>]} />
      <ul className="sig" onMouseLeave={() => setHover(null)}>
        {DISHES.map((d, i) => (
          <li key={d.key} onMouseEnter={() => setHover(i)} data-cursor="Taste">
            <span className="mono">{pad(i + 1)}</span>
            <span className="sig-name">{d.t1} <em>{d.t2}</em></span>
            <span className="sig-cat mono">{d.cat}</span>
            <span className="sig-price mono">{d.price}</span>
          </li>
        ))}
      </ul>
      <div className={cn("sig-thumb", hover !== null && "is-on")} ref={thumb} aria-hidden>
        {DISHES.map((d, i) => <img key={d.key} src={img(d.img)} alt="" className={cn(i === hover && "is-on")} />)}
      </div>

      <div className="full-menu">
        <div className="tabs" role="tablist">
          {MENU.map((c, i) => (
            <button key={c.cat} role="tab" aria-selected={tab === i} className={cn("tab mono", tab === i && "is-active")} onClick={() => setTab(i)}>{c.cat}</button>
          ))}
        </div>
        <div className="menu-items" key={tab}>
          {MENU[tab].items.map((it) => (
            <div className="menu-item" key={it.name}>
              <div><h4>{it.name} {it.veg && <span className="veg" title="Vegetarian">veg</span>}</h4><p>{it.desc}</p></div>
              <span className="mono">{it.price}</span>
            </div>
          ))}
        </div>
        <p className="mono muted menu-note">Prices in AUD. Tell us about allergies — we cook everything to order.</p>
      </div>
    </section>
  );
}

/* ---------- 05 Tandoor ---------- */
function Sparks() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, ctx = c.getContext("2d")!;
    if (reducedMotion()) return;
    const N = window.innerWidth < 900 ? 70 : 160;
    let w = 0, h = 0, raf = 0, vis = false;
    const resize = () => { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; };
    resize();
    const P = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 2 + 0.5, v: Math.random() * 0.002 + 0.001, d: Math.random() * 2 - 1, l: Math.random() }));
    const col = getComputedStyle(c).color;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = col;
      for (const p of P) {
        p.y -= p.v; p.x += Math.sin((p.y + p.d) * 8) * 0.0006; p.l -= 0.002;
        if (p.y < 0 || p.l < 0) { p.y = 1; p.x = Math.random(); p.l = 1; }
        ctx.globalAlpha = Math.max(0, p.l) * (1 - Math.abs(0.5 - p.y));
        ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.s, 0, 7); ctx.fill();
      }
      if (vis) raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; cancelAnimationFrame(raf); if (vis) draw(); });
    io.observe(c);
    window.addEventListener("resize", resize);
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas className="sparks" ref={ref} />;
}
function Tilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="tilt" ref={ref}
      onMouseMove={(e) => {
        if (reducedMotion()) return;
        const r = ref.current!.getBoundingClientRect();
        gsap.to(ref.current, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 12, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 12, duration: 0.5 });
      }}
      onMouseLeave={() => gsap.to(ref.current, { rotationX: 0, rotationY: 0, duration: 0.8, ease: "elastic.out(1,0.5)" })}>
      {children}
    </div>
  );
}
export function Tandoor() {
  const ref = useGsap((el) => {
    const n = el.querySelector(".deg-n")!;
    const o = { v: 0 };
    gsap.to(o, { v: 480, duration: 2, ease: "power2.out", scrollTrigger: { trigger: n, start: "top 85%" }, onUpdate: () => { n.textContent = String(Math.round(o.v)); } });
  });
  const cards = [
    { k: "tandoori", t: "Tandoori chicken", d: "Twelve hours in Kashmiri chilli and hung yoghurt." },
    { k: "seekh", t: "Lamb seekh", d: "Minced by hand. Basted with ghee as it spins." },
    { k: "paneer", t: "Paneer tikka", d: "Charred at the edges, soft in the middle." },
  ];
  return (
    <section className="section tandoor" id="tandoor" ref={ref}>
      <img className="tandoor-bg" src={img("embers")} alt="" loading="lazy" />
      <Sparks />
      <div className="tandoor-inner">
        <Eyebrow n="05" label="From the tandoor" hi="तंदूर" />
        <div className="tandoor-head">
          <Lines lines={["Fire does the", <em key="t">talking.</em>]} />
          <p className="deg mono"><span className="deg-n">0</span>°C</p>
        </div>
        <div className="tandoor-cards">
          {cards.map((c) => (
            <Tilt key={c.k}>
              <Film k={c.k} cursor="Fire" />
              <div className="tilt-body"><h3>{c.t}</h3><p>{c.d}</p></div>
            </Tilt>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pour ---------- */
export function Pour() {
  const ref = useGsap((el, reduce) => {
    if (reduce) return;
    el.querySelectorAll<HTMLElement>(".pour-word").forEach((w, i) => {
      gsap.fromTo(w, { xPercent: i % 2 ? 60 : -60, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: w, start: "top 95%", end: "top 45%", scrub: 0.6 } });
    });
  });
  return (
    <section className="pour" ref={ref}>
      <div className="pour-stage">
        <div className="pour-sticky"><Film k="gravy-pour" /></div>
        <div className="pour-words">
          <p className="pour-word">Butter.</p>
          <p className="pour-word"><em>Ghee.</em></p>
          <p className="pour-word">Patience.</p>
        </div>
      </div>
      <div className="pour-row">
        {["butter-chicken", "dal", "naan", "lassi"].map((k) => {
          const d = DISHES.find((x) => x.key === k)!;
          return (
            <figure key={k} data-cursor="Taste"><Film k={k} /><figcaption className="mono">{d.t1} {d.t2} · {d.price}</figcaption></figure>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- 06 Rules ---------- */
export function Rules() {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((x) => (x + d + RULES.length) % RULES.length);
  useEffect(() => { const id = setInterval(() => go(1), 7000); return () => clearInterval(id); }, [i]);
  return (
    <section className="section rules">
      <Eyebrow n="06" label="House rules" hi="नियम" />
      <div className="rules-stage">
        {RULES.map((r, n) => (
          <blockquote key={n} className={cn("rule", n === i && "is-on")} aria-hidden={n !== i}>
            <p>“{r.q}”</p><cite className="mono">{r.by}</cite>
          </blockquote>
        ))}
      </div>
      <div className="rules-ctrl">
        <button className="circle" onClick={() => go(-1)} aria-label="Previous rule" data-magnetic>←</button>
        <div className="dots">{RULES.map((_, n) => <button key={n} className={cn(n === i && "is-on")} onClick={() => setI(n)} aria-label={`Rule ${n + 1}`} />)}</div>
        <button className="circle" onClick={() => go(1)} aria-label="Next rule" data-magnetic>→</button>
      </div>
    </section>
  );
}

/* ---------- 07 Visit ---------- */
function LocalTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat("en-AU", { timeZone: SITE.timezone, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(new Date()));
    f(); const id = setInterval(f, 1000); return () => clearInterval(id);
  }, []);
  return <>{t || "--:--:--"}</>;
}
export function Visit() {
  const status = useOpenStatus();
  const ref = useGsap((el) => {
    el.querySelectorAll<HTMLElement>("[data-count]").forEach((n) => {
      const o = { v: 0 }, to = Number(n.dataset.count);
      gsap.to(o, { v: to, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: n, start: "top 90%" }, onUpdate: () => { n.textContent = String(Math.round(o.v)); } });
    });
  });
  const stats = [[90, "min", "on dum"], [11, "", "spices"], [480, "°C", "in the tandoor"], [12, "hrs", "of marinade"]] as const;
  return (
    <section className="section visit" id="visit" ref={ref}>
      <Film k="storefront" className="visit-bg" />
      <div className="visit-inner">
        <Eyebrow n="07" label="Visit" hi="आइए" />
        <Lines lines={["Come lift", <>the <em>lid.</em></>]} />
        <div className="stats">
          {stats.map(([n, u, l]) => <div key={l}><p className="stat-n"><span data-count={n}>0</span><small>{u}</small></p><p className="mono muted">{l}</p></div>)}
        </div>
        <div className="visit-grid">
          <div><p className="mono muted">Local time · {SITE.city}</p><p className="big-mono mono"><LocalTime /></p>
            {status && <p className={cn("pill mono", status.open ? "is-open" : "is-closed")}><i />{status.label}</p>}</div>
          <div><p className="mono muted">Find us</p><p>{SITE.address}</p><p><a className="roll" data-text={SITE.phone} href={SITE.phoneHref}><span>{SITE.phone}</span></a></p><p><a className="roll" data-text={SITE.instagram} href={SITE.instagramUrl} target="_blank" rel="noreferrer"><span>{SITE.instagram}</span></a></p></div>
          <div><p className="mono muted">Hours</p>{SITE.hoursText.map((h) => <p key={h}>{h}</p>)}</div>
        </div>
        <div className="ctas">
          <a className="btn btn-primary btn-xl" data-magnetic href={SITE.phoneHref}>Call to order</a>
          <button className="btn btn-ghost btn-xl" data-magnetic onClick={() => scrollToSel("#menu")}>See the menu</button>
          <a className="btn btn-ghost btn-xl" data-magnetic href={SITE.mapsUrl} target="_blank" rel="noreferrer">Get directions</a>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
export function Footer() {
  const ref = useGsap((el, reduce) => {
    if (reduce) return;
    gsap.from(el.querySelectorAll(".wordmark span"), { yPercent: 110, stagger: { each: 0.05, from: "center" }, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 80%" } });
  });
  return (
    <footer className="footer" ref={ref}>
      <p className="footer-ek">Ek plate <em>aur?</em> <span className="hindi">एक प्लेट और?</span></p>
      <h2 className="wordmark" aria-label={SITE.nameB}>{SITE.nameB.toUpperCase().split("").map((c, i) => <span key={i}>{c}</span>)}</h2>
      <div className="footer-row mono"><span>© {new Date().getFullYear()} {SITE.name} · {SITE.city}</span><span>{SITE.address}</span><a href={SITE.phoneHref}>{SITE.phone}</a></div>
    </footer>
  );
}

/* ---------- global line reveals ---------- */
export function useLineReveals() {
  useEffect(() => {
    if (reducedMotion()) return;
    const ctx = gsap.context(() => {
      document.querySelectorAll(".split").forEach((h) => {
        gsap.from(h.querySelectorAll(".ln > span"), { yPercent: 110, stagger: 0.08, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } });
      });
    });
    return () => ctx.revert();
  }, []);
}
