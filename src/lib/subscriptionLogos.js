const BRANDS = {
  // Streaming — Video
  netflix: { domain: "netflix.com", color: "#E50914" },
  "disney+": { domain: "disneyplus.com", color: "#113CCF" },
  "disney plus": { domain: "disneyplus.com", color: "#113CCF" },
  disneyplus: { domain: "disneyplus.com", color: "#113CCF" },
  hulu: { domain: "hulu.com", color: "#1CE783" },
  "hbo max": { domain: "max.com", color: "#5B2D8E" },
  max: { domain: "max.com", color: "#5B2D8E" },
  "amazon prime video": { domain: "primevideo.com", color: "#00A8E1" },
  "amazon prime": { domain: "primevideo.com", color: "#00A8E1" },
  "prime video": { domain: "primevideo.com", color: "#00A8E1" },
  primevideo: { domain: "primevideo.com", color: "#00A8E1" },
  "apple tv+": { domain: "apple.com", color: "#555555" },
  "apple tv": { domain: "apple.com", color: "#555555" },
  "appletv+": { domain: "apple.com", color: "#555555" },
  "youtube premium": { domain: "youtube.com", color: "#FF0000" },
  "youtube tv": { domain: "youtube.com", color: "#FF0000" },
  youtube: { domain: "youtube.com", color: "#FF0000" },
  peacock: { domain: "peacocktv.com", color: "#000000" },
  "paramount+": { domain: "paramountplus.com", color: "#0064FF" },
  paramount: { domain: "paramountplus.com", color: "#0064FF" },
  crunchyroll: { domain: "crunchyroll.com", color: "#F47521" },
  mubi: { domain: "mubi.com", color: "#000000" },
  "discovery+": { domain: "discoveryplus.com", color: "#0073CF" },
  discovery: { domain: "discoveryplus.com", color: "#0073CF" },
  dazn: { domain: "dazn.com", color: "#F8FF00" },
  fubo: { domain: "fubo.tv", color: "#E30613" },
  sling: { domain: "sling.com", color: "#1E90FF" },
  plex: { domain: "plex.tv", color: "#E5A00D" },
  "curiosity stream": { domain: "curiositystream.com", color: "#000000" },
  viaplay: { domain: "viaplay.com", color: "#FF0050" },
  skyshowtime: { domain: "skyshowtime.com", color: "#0B0B0B" },
  "sky go": { domain: "sky.com", color: "#001489" },
  sky: { domain: "sky.com", color: "#001489" },
  ruutu: { domain: "ruutu.fi", color: "#E31E24" },
  "mtv katsomo": { domain: "mtv.fi", color: "#E31E24" },
  "yle areena": { domain: "yle.fi", color: "#009AC7" },
  "tv4 play": { domain: "tv4.se", color: "#E30613" },
  svtplay: { domain: "svtplay.se", color: "#1A1A1A" },
  "nrk tv": { domain: "nrk.no", color: "#262626" },

  // Streaming — Music
  spotify: { domain: "spotify.com", color: "#1DB954" },
  "apple music": { domain: "apple.com", color: "#FA243C" },
  tidal: { domain: "tidal.com", color: "#000000" },
  deezer: { domain: "deezer.com", color: "#A238FF" },
  "amazon music": { domain: "amazon.com", color: "#FF9900" },
  pandora: { domain: "pandora.com", color: "#224099" },
  soundcloud: { domain: "soundcloud.com", color: "#FF5500" },
  "youtube music": { domain: "youtube.com", color: "#FF0000" },
  qobuz: { domain: "qobuz.com", color: "#08326F" },
  "pocket casts": { domain: "pocketcasts.com", color: "#F43E37" },

  // AI Tools
  chatgpt: { domain: "openai.com", color: "#10A37F" },
  openai: { domain: "openai.com", color: "#10A37F" },
  claude: { domain: "anthropic.com", color: "#D97757" },
  anthropic: { domain: "anthropic.com", color: "#D97757" },
  midjourney: { domain: "midjourney.com", color: "#2D3A8C" },
  "github copilot": { domain: "github.com", color: "#24292F" },
  copilot: { domain: "microsoft.com", color: "#0078D4" },
  gemini: { domain: "google.com", color: "#4285F4" },
  perplexity: { domain: "perplexity.ai", color: "#20B2AA" },
  "notion ai": { domain: "notion.so", color: "#000000" },
  jasper: { domain: "jasper.ai", color: "#FF5733" },
  grammarly: { domain: "grammarly.com", color: "#15C39A" },
  writesonic: { domain: "writesonic.com", color: "#7B2FBE" },
  "eleven labs": { domain: "elevenlabs.io", color: "#000000" },
  elevenlabs: { domain: "elevenlabs.io", color: "#000000" },
  runway: { domain: "runwayml.com", color: "#000000" },
  cursor: { domain: "cursor.sh", color: "#000000" },

  // Productivity & Work
  notion: { domain: "notion.so", color: "#000000" },
  slack: { domain: "slack.com", color: "#4A154B" },
  zoom: { domain: "zoom.us", color: "#2D8CFF" },
  "microsoft 365": { domain: "microsoft.com", color: "#D83B01" },
  "office 365": { domain: "microsoft.com", color: "#D83B01" },
  "ms 365": { domain: "microsoft.com", color: "#D83B01" },
  microsoft: { domain: "microsoft.com", color: "#00A4EF" },
  "google one": { domain: "google.com", color: "#4285F4" },
  "google workspace": { domain: "workspace.google.com", color: "#4285F4" },
  dropbox: { domain: "dropbox.com", color: "#0061FF" },
  adobe: { domain: "adobe.com", color: "#FF0000" },
  "adobe creative cloud": { domain: "adobe.com", color: "#DA1F26" },
  "creative cloud": { domain: "adobe.com", color: "#DA1F26" },
  figma: { domain: "figma.com", color: "#F24E1E" },
  canva: { domain: "canva.com", color: "#00C4CC" },
  evernote: { domain: "evernote.com", color: "#00A82D" },
  todoist: { domain: "todoist.com", color: "#DB4035" },
  asana: { domain: "asana.com", color: "#F06A6A" },
  trello: { domain: "trello.com", color: "#0052CC" },
  jira: { domain: "atlassian.com", color: "#0052CC" },
  confluence: { domain: "atlassian.com", color: "#0052CC" },
  atlassian: { domain: "atlassian.com", color: "#0052CC" },
  "monday.com": { domain: "monday.com", color: "#FF3D57" },
  monday: { domain: "monday.com", color: "#FF3D57" },
  linear: { domain: "linear.app", color: "#5E6AD2" },
  clickup: { domain: "clickup.com", color: "#7B68EE" },
  airtable: { domain: "airtable.com", color: "#2D7FF9" },
  webflow: { domain: "webflow.com", color: "#4353FF" },
  loom: { domain: "loom.com", color: "#625DF5" },
  miro: { domain: "miro.com", color: "#FFD02F" },
  hubspot: { domain: "hubspot.com", color: "#FF7A59" },
  salesforce: { domain: "salesforce.com", color: "#00A1E0" },
  intercom: { domain: "intercom.com", color: "#6AFDEF" },
  zendesk: { domain: "zendesk.com", color: "#03363D" },
  "google drive": { domain: "google.com", color: "#4285F4" },
  "icloud+": { domain: "apple.com", color: "#3478F6" },
  icloud: { domain: "apple.com", color: "#3478F6" },
  "one drive": { domain: "microsoft.com", color: "#0078D4" },
  onedrive: { domain: "microsoft.com", color: "#0078D4" },
  box: { domain: "box.com", color: "#0061D5" },

  // Security & VPN
  "1password": { domain: "1password.com", color: "#1A8CFF" },
  lastpass: { domain: "lastpass.com", color: "#CC0000" },
  dashlane: { domain: "dashlane.com", color: "#005FF5" },
  bitwarden: { domain: "bitwarden.com", color: "#175DDC" },
  nordvpn: { domain: "nordvpn.com", color: "#4687FF" },
  expressvpn: { domain: "expressvpn.com", color: "#DA3940" },
  surfshark: { domain: "surfshark.com", color: "#1B91F0" },
  mullvad: { domain: "mullvad.net", color: "#FFCC00" },
  proton: { domain: "proton.me", color: "#6D4AFF" },
  "proton vpn": { domain: "proton.me", color: "#6D4AFF" },
  "proton mail": { domain: "proton.me", color: "#6D4AFF" },
  protonmail: { domain: "proton.me", color: "#6D4AFF" },
  malwarebytes: { domain: "malwarebytes.com", color: "#00B4E6" },
  norton: { domain: "norton.com", color: "#FDB511" },
  kaspersky: { domain: "kaspersky.com", color: "#006D5C" },

  // Gaming
  "xbox game pass": { domain: "xbox.com", color: "#107C10" },
  "xbox gamepass": { domain: "xbox.com", color: "#107C10" },
  xbox: { domain: "xbox.com", color: "#107C10" },
  "playstation plus": { domain: "playstation.com", color: "#003087" },
  "ps plus": { domain: "playstation.com", color: "#003087" },
  "ps5": { domain: "playstation.com", color: "#003087" },
  psn: { domain: "playstation.com", color: "#003087" },
  playstation: { domain: "playstation.com", color: "#003087" },
  "nintendo switch online": { domain: "nintendo.com", color: "#E4000F" },
  nintendo: { domain: "nintendo.com", color: "#E4000F" },
  "ea play": { domain: "ea.com", color: "#FF4747" },
  "ea sports": { domain: "ea.com", color: "#FF4747" },
  twitch: { domain: "twitch.tv", color: "#9146FF" },
  steam: { domain: "steampowered.com", color: "#1B2838" },
  "epic games": { domain: "epicgames.com", color: "#313131" },
  "ubisoft+": { domain: "ubisoft.com", color: "#0070FF" },
  ubisoft: { domain: "ubisoft.com", color: "#0070FF" },
  "riot games": { domain: "riotgames.com", color: "#D0021B" },
  battlenet: { domain: "battle.net", color: "#009AE4" },
  "battle.net": { domain: "battle.net", color: "#009AE4" },
  blizzard: { domain: "battle.net", color: "#009AE4" },
  "humble bundle": { domain: "humblebundle.com", color: "#CC2929" },
  gog: { domain: "gog.com", color: "#86328A" },

  // Cloud & Dev
  github: { domain: "github.com", color: "#24292F" },
  vercel: { domain: "vercel.com", color: "#000000" },
  netlify: { domain: "netlify.com", color: "#00C7B7" },
  heroku: { domain: "heroku.com", color: "#430098" },
  digitalocean: { domain: "digitalocean.com", color: "#0080FF" },
  cloudflare: { domain: "cloudflare.com", color: "#F38020" },
  aws: { domain: "aws.amazon.com", color: "#FF9900" },
  "amazon web services": { domain: "aws.amazon.com", color: "#FF9900" },
  azure: { domain: "microsoft.com", color: "#0078D4" },
  "google cloud": { domain: "cloud.google.com", color: "#4285F4" },
  setapp: { domain: "setapp.com", color: "#6A5ACD" },
  "jetbrains": { domain: "jetbrains.com", color: "#000000" },
  gitlab: { domain: "gitlab.com", color: "#FC6D26" },
  sentry: { domain: "sentry.io", color: "#362D59" },
  datadog: { domain: "datadoghq.com", color: "#632CA6" },
  postman: { domain: "postman.com", color: "#FF6C37" },

  // Fitness & Health
  peloton: { domain: "onepeloton.com", color: "#E01F27" },
  strava: { domain: "strava.com", color: "#FC4C02" },
  calm: { domain: "calm.com", color: "#4A90D9" },
  headspace: { domain: "headspace.com", color: "#F47D31" },
  noom: { domain: "noom.com", color: "#5DB075" },
  whoop: { domain: "whoop.com", color: "#000000" },
  "apple fitness": { domain: "apple.com", color: "#FA243C" },
  garmin: { domain: "garmin.com", color: "#007DC5" },
  "my fitness pal": { domain: "myfitnesspal.com", color: "#0097D1" },
  myfitnesspal: { domain: "myfitnesspal.com", color: "#0097D1" },
  "eight sleep": { domain: "eightsleep.com", color: "#000000" },

  // News & Learning
  "new york times": { domain: "nytimes.com", color: "#000000" },
  nytimes: { domain: "nytimes.com", color: "#000000" },
  nyt: { domain: "nytimes.com", color: "#000000" },
  "the economist": { domain: "economist.com", color: "#E3120B" },
  economist: { domain: "economist.com", color: "#E3120B" },
  medium: { domain: "medium.com", color: "#000000" },
  substack: { domain: "substack.com", color: "#FF6719" },
  audible: { domain: "audible.com", color: "#F8991D" },
  "kindle unlimited": { domain: "amazon.com", color: "#FF9900" },
  kindle: { domain: "amazon.com", color: "#FF9900" },
  duolingo: { domain: "duolingo.com", color: "#58CC02" },
  masterclass: { domain: "masterclass.com", color: "#1A1A1A" },
  skillshare: { domain: "skillshare.com", color: "#00DE76" },
  coursera: { domain: "coursera.org", color: "#0056D2" },
  "linkedin premium": { domain: "linkedin.com", color: "#0A66C2" },
  linkedin: { domain: "linkedin.com", color: "#0A66C2" },
  blinkist: { domain: "blinkist.com", color: "#00BBCF" },
  scribd: { domain: "scribd.com", color: "#1E7B85" },
  readwise: { domain: "readwise.io", color: "#FF8C00" },
  "wall street journal": { domain: "wsj.com", color: "#004276" },
  wsj: { domain: "wsj.com", color: "#004276" },
  "financial times": { domain: "ft.com", color: "#FCD0B1" },
  ft: { domain: "ft.com", color: "#FCD0B1" },

  // Finance & Banking
  revolut: { domain: "revolut.com", color: "#191C1F" },
  monzo: { domain: "monzo.com", color: "#FF3464" },
  "trading 212": { domain: "trading212.com", color: "#00C176" },
  trading212: { domain: "trading212.com", color: "#00C176" },
  wise: { domain: "wise.com", color: "#9FE870" },
  "transferwise": { domain: "wise.com", color: "#9FE870" },
  paypal: { domain: "paypal.com", color: "#003087" },
  stripe: { domain: "stripe.com", color: "#6772E5" },
  "cash app": { domain: "cash.app", color: "#00D632" },
  venmo: { domain: "venmo.com", color: "#3D95CE" },
  robinhood: { domain: "robinhood.com", color: "#00C805" },
  coinbase: { domain: "coinbase.com", color: "#0052FF" },
  n26: { domain: "n26.com", color: "#48AC98" },
  "klarna": { domain: "klarna.com", color: "#FFB3C7" },

  // Amazon (general)
  amazon: { domain: "amazon.com", color: "#FF9900" },
  "amazon.com": { domain: "amazon.com", color: "#FF9900" },

  // Apple Services
  "apple one": { domain: "apple.com", color: "#555555" },
  "apple arcade": { domain: "apple.com", color: "#555555" },
  "apple news": { domain: "apple.com", color: "#FA243C" },
  "apple storage": { domain: "apple.com", color: "#3478F6" },
  apple: { domain: "apple.com", color: "#555555" },

  // Communication
  "google fi": { domain: "fi.google.com", color: "#4285F4" },
  "microsoft teams": { domain: "microsoft.com", color: "#6264A7" },
  teams: { domain: "microsoft.com", color: "#6264A7" },
  discord: { domain: "discord.com", color: "#5865F2" },
  telegram: { domain: "telegram.org", color: "#2AABEE" },
  whatsapp: { domain: "whatsapp.com", color: "#25D366" },
  skype: { domain: "skype.com", color: "#00AFF0" },
  "google meet": { domain: "meet.google.com", color: "#00BFA5" },
  "ring central": { domain: "ringcentral.com", color: "#FFCB00" },

  // E-commerce & Food
  "shopify": { domain: "shopify.com", color: "#96BF48" },
  "squarespace": { domain: "squarespace.com", color: "#000000" },
  wix: { domain: "wix.com", color: "#0C6EFC" },
  "wordpress": { domain: "wordpress.com", color: "#21759B" },
  etsy: { domain: "etsy.com", color: "#F1641E" },
};

// Normalise a raw transaction/subscription name before matching
function normalise(raw) {
  return raw
    .toLowerCase()
    // Remove everything after * (e.g. "AMAZON PRIME*ABC123" → "AMAZON PRIME")
    .replace(/\*.+$/, "")
    // Remove common TLDs and www
    .replace(/\b(www\.)\b/g, "")
    .replace(/\.(com|net|org|io|tv|co|uk|fi|se|no|de|fr|es|it)\b/g, "")
    // Remove common corporate suffixes
    .replace(/\b(ab|inc|ltd|llc|gmbh|oy|as|bv|sas|sa|ag|plc|corp|co)\b/g, "")
    // Remove trailing digits/codes
    .replace(/\s+\d{4,}$/, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

export function getSubscriptionBrand(name) {
  if (!name) return null;

  const key = normalise(name);

  // Exact match first
  if (BRANDS[key]) return BRANDS[key];

  // Then try starts-with or includes for longer brand names first (most specific)
  const sorted = Object.entries(BRANDS).sort((a, b) => b[0].length - a[0].length);
  for (const [brand, data] of sorted) {
    if (key === brand || key.startsWith(brand) || key.includes(brand)) {
      return data;
    }
  }

  return null;
}

export function normalizeLogoDomain(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";

  const withoutProtocol = raw.replace(/^https?:\/\//, "");
  const withoutPath = withoutProtocol.split("/")[0].split("?")[0].split("#")[0];
  const withoutPort = withoutPath.split(":")[0];
  const normalized = withoutPort.replace(/^www\./, "").trim();

  if (!normalized.includes(".")) {
    return "";
  }

  if (!/^[a-z0-9.-]+$/.test(normalized)) {
    return "";
  }

  if (normalized.startsWith(".") || normalized.endsWith(".")) {
    return "";
  }

  return normalized;
}

export function inferSubscriptionLogoDomain(name = "") {
  const brand = getSubscriptionBrand(name);
  return normalizeLogoDomain(brand?.domain || "");
}

export function resolveSubscriptionLogoDomain({ name = "", logoDomain = "" } = {}) {
  const explicit = normalizeLogoDomain(logoDomain);
  if (explicit) {
    return explicit;
  }

  return inferSubscriptionLogoDomain(name);
}

export function getLogoUrl(domain) {
  return `https://logo.clearbit.com/${domain}`;
}
