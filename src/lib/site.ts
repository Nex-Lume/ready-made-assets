// Every business detail lives here. Rename, re-price or re-time the restaurant in this file.
export const SITE = {
  name: "Mr. Biriyaniwala",
  nameA: "Mr.",
  nameB: "Biriyaniwala",
  city: "Adelaide",
  timezone: "Australia/Adelaide",
  phone: "(08) 8000 0000",
  phoneHref: "tel:+61880000000",
  address: "123 Gouger Street, Adelaide SA 5000",
  mapsUrl: "https://maps.google.com/?q=Gouger+Street+Adelaide",
  instagram: "@mr.biriyaniwala",
  instagramUrl: "https://instagram.com/",
  // 0 = Sunday … 6 = Saturday. Times are 24h in the restaurant's time zone. null = closed.
  hours: [
    { day: 0, open: "11:30", close: "22:00" },
    { day: 1, open: null, close: null },
    { day: 2, open: "11:30", close: "22:00" },
    { day: 3, open: "11:30", close: "22:00" },
    { day: 4, open: "11:30", close: "22:00" },
    { day: 5, open: "11:30", close: "23:00" },
    { day: 6, open: "11:30", close: "23:00" },
  ] as { day: number; open: string | null; close: string | null }[],
  hoursText: ["Tue – Thu · 11:30 – 22:00", "Fri – Sat · 11:30 – 23:00", "Sun · 11:30 – 22:00", "Mon · Closed (the handis rest)"],
};

const toMin = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Local weekday and minutes-past-midnight in a time zone. */
export function zonedNow(now: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function openStatus(now: Date, site = SITE): { open: boolean; label: string } {
  const { day, minutes } = zonedNow(now, site.timezone);
  const today = site.hours.find((h) => h.day === day);
  if (today?.open && today.close && minutes >= toMin(today.open) && minutes < toMin(today.close)) {
    return { open: true, label: `Open now · until ${today.close}` };
  }
  if (today?.open && minutes < toMin(today.open)) return { open: false, label: `Closed · opens ${today.open}` };
  for (let i = 1; i <= 7; i++) {
    const h = site.hours.find((x) => x.day === (day + i) % 7);
    if (h?.open) {
      const name = i === 1 ? "tomorrow" : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][h.day];
      return { open: false, label: `Closed · opens ${name} ${h.open}` };
    }
  }
  return { open: false, label: "Closed" };
}

export type Dish = {
  key: string; img: string; word: string; cat: string; t1: string; t2: string;
  desc: string; price: string; accent: string; hindi: string;
};

// The eight hero dishes, in scroll order. `key` matches the processed hero clip name.
export const DISHES: Dish[] = [
  { key: "biryani", img: "handi-dum", word: "Biriyani", cat: "Hyderabadi dum", t1: "Chicken dum", t2: "biryani", desc: "Aged basmati, bone-in chicken and saffron, sealed with dough and cooked on dum for ninety minutes.", price: "$26", accent: "oklch(0.77 0.15 70)", hindi: "बिरयानी" },
  { key: "butter-chicken", img: "butter-chicken", word: "Makhani", cat: "From the kadai", t1: "Butter", t2: "chicken", desc: "Charred tikka in a tomato-makhani gravy finished with cream and a cube of white butter.", price: "$24", accent: "oklch(0.68 0.17 50)", hindi: "मखनी" },
  { key: "tandoori", img: "tandoori", word: "Tandoori", cat: "From the tandoor", t1: "Tandoori", t2: "chicken", desc: "Kashmiri chilli, hung yoghurt and twelve hours in the marinade before the 480° clay.", price: "$22", accent: "oklch(0.58 0.19 32)", hindi: "तंदूरी" },
  { key: "seekh", img: "seekh", word: "Seekh", cat: "On the skewer", t1: "Lamb seekh", t2: "kebab", desc: "Hand-minced lamb, green chilli and mint pressed onto iron and basted with ghee.", price: "$21", accent: "oklch(0.62 0.13 45)", hindi: "सीख़" },
  { key: "paneer", img: "paneer", word: "Tikka", cat: "Vegetarian", t1: "Paneer", t2: "tikka", desc: "Fresh paneer, capsicum and onion, charred in a smoky orange tikka marinade.", price: "$20", accent: "oklch(0.74 0.16 60)", hindi: "टिक्का" },
  { key: "dal", img: "dal", word: "Dal", cat: "Slow pot", t1: "Dal", t2: "makhani", desc: "Black lentils simmered overnight on the dying tandoor coals. Butter, cream, patience.", price: "$18", accent: "oklch(0.55 0.1 40)", hindi: "दाल" },
  { key: "naan", img: "naan", word: "Naan", cat: "Breads", t1: "Garlic butter", t2: "naan", desc: "Slapped onto the tandoor wall, blistered in seconds and drowned in garlic butter.", price: "$6", accent: "oklch(0.82 0.12 85)", hindi: "नान" },
  { key: "lassi", img: "lassi", word: "Lassi", cat: "To finish", t1: "Mango", t2: "lassi", desc: "Alphonso mango, thick yoghurt, cardamom, pistachio and a few threads of saffron.", price: "$8", accent: "oklch(0.85 0.14 80)", hindi: "लस्सी" },
];

export const MENU: { cat: string; items: { name: string; desc: string; price: string; veg?: boolean }[] }[] = [
  { cat: "Biryani", items: [
    { name: "Chicken dum biryani", desc: "Bone-in, saffron, fried onion, mint", price: "$26" },
    { name: "Lamb dum biryani", desc: "Slow lamb shoulder, kewra, ghee", price: "$29" },
    { name: "Hyderabadi egg biryani", desc: "Boiled eggs roasted in masala", price: "$22" },
    { name: "Subz dum biryani", desc: "Seasonal vegetables, paneer, cashew", price: "$21", veg: true },
    { name: "Family handi (serves 4)", desc: "Any biryani, opened at the table", price: "$92" },
  ]},
  { cat: "Tandoor", items: [
    { name: "Tandoori chicken", desc: "Half bird, Kashmiri chilli", price: "$22" },
    { name: "Lamb seekh kebab", desc: "Two skewers, mint chutney", price: "$21" },
    { name: "Chicken tikka", desc: "Hung yoghurt, mustard oil", price: "$20" },
    { name: "Paneer tikka", desc: "Capsicum, onion, tikka marinade", price: "$20", veg: true },
    { name: "Tandoori prawns", desc: "Ajwain, garlic, lemon", price: "$28" },
  ]},
  { cat: "Curries", items: [
    { name: "Butter chicken", desc: "Makhani gravy, cream, butter", price: "$24" },
    { name: "Lamb rogan josh", desc: "Kashmiri chilli, fennel", price: "$26" },
    { name: "Dal makhani", desc: "Overnight black lentils", price: "$18", veg: true },
    { name: "Palak paneer", desc: "Spinach, garlic, fresh paneer", price: "$20", veg: true },
    { name: "Mirchi ka salan", desc: "Hyderabadi chilli & peanut curry", price: "$16", veg: true },
  ]},
  { cat: "Breads", items: [
    { name: "Garlic butter naan", desc: "Blistered, drowned in butter", price: "$6", veg: true },
    { name: "Butter naan", desc: "The classic", price: "$5", veg: true },
    { name: "Laccha paratha", desc: "Flaky layers, ghee", price: "$6", veg: true },
    { name: "Cheese kulcha", desc: "Stuffed, charred", price: "$8", veg: true },
  ]},
  { cat: "Sides & Sweets", items: [
    { name: "Burani raita", desc: "Roasted garlic yoghurt", price: "$6", veg: true },
    { name: "Double ka meetha", desc: "Hyderabadi bread pudding, saffron", price: "$10", veg: true },
    { name: "Gulab jamun", desc: "Two, warm, rose syrup", price: "$8", veg: true },
  ]},
  { cat: "Drinks", items: [
    { name: "Mango lassi", desc: "Alphonso, cardamom, pistachio", price: "$8", veg: true },
    { name: "Masala chai", desc: "Brewed with milk, ginger, clove", price: "$5", veg: true },
    { name: "Rose sharbat", desc: "Basil seeds, lime", price: "$7", veg: true },
  ]},
];

export const SPICES = [
  { en: "Green cardamom", hi: "इलायची" }, { en: "Black cardamom", hi: "बड़ी इलायची" },
  { en: "Clove", hi: "लौंग" }, { en: "Cinnamon", hi: "दालचीनी" }, { en: "Star anise", hi: "चक्र फूल" },
  { en: "Bay leaf", hi: "तेज पत्ता" }, { en: "Mace", hi: "जावित्री" }, { en: "Nutmeg", hi: "जायफल" },
  { en: "Saffron", hi: "केसर" }, { en: "Shahi jeera", hi: "शाही जीरा" }, { en: "Black pepper", hi: "काली मिर्च" },
];

export const RULES = [
  { q: "Leftovers are a compliment. Containers are on the house.", by: "House rule no. 1" },
  { q: "The lid comes off at your table. Phones up, the first breath of steam is yours.", by: "House rule no. 2" },
  { q: "We run out. When the handi is empty, the biryani is done for the day.", by: "House rule no. 3" },
  { q: "Eat with your hands if you like. Nobody here is judging. We are jealous.", by: "House rule no. 4" },
];
