const BRANDS = {
  // Streaming — Video
  netflix: { domain: "netflix.com", color: "#E50914" },
  "disney+": { domain: "disneyplus.com", color: "#113CCF" },
  "disney plus": { domain: "disneyplus.com", color: "#113CCF" },
  hulu: { domain: "hulu.com", color: "#1CE783" },
  "hbo max": { domain: "max.com", color: "#5B2D8E" },
  max: { domain: "max.com", color: "#5B2D8E" },
  "amazon prime": { domain: "primevideo.com", color: "#00A8E1" },
  "prime video": { domain: "primevideo.com", color: "#00A8E1" },
  "apple tv+": { domain: "apple.com", color: "#555555" },
  "apple tv": { domain: "apple.com", color: "#555555" },
  "youtube premium": { domain: "youtube.com", color: "#FF0000" },
  peacock: { domain: "peacocktv.com", color: "#000000" },
  "paramount+": { domain: "paramountplus.com", color: "#0064FF" },
  crunchyroll: { domain: "crunchyroll.com", color: "#F47521" },
  mubi: { domain: "mubi.com", color: "#000000" },
  "discovery+": { domain: "discoveryplus.com", color: "#0073CF" },
  dazn: { domain: "dazn.com", color: "#F8FF00" },
  fubo: { domain: "fubo.tv", color: "#E30613" },
  sling: { domain: "sling.com", color: "#1E90FF" },

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

  // Productivity & Work
  notion: { domain: "notion.so", color: "#000000" },
  slack: { domain: "slack.com", color: "#4A154B" },
  zoom: { domain: "zoom.us", color: "#2D8CFF" },
  "microsoft 365": { domain: "microsoft.com", color: "#D83B01" },
  "office 365": { domain: "microsoft.com", color: "#D83B01" },
  microsoft: { domain: "microsoft.com", color: "#00A4EF" },
  "google one": { domain: "google.com", color: "#4285F4" },
  "google workspace": { domain: "workspace.google.com", color: "#4285F4" },
  dropbox: { domain: "dropbox.com", color: "#0061FF" },
  adobe: { domain: "adobe.com", color: "#FF0000" },
  "adobe creative cloud": { domain: "adobe.com", color: "#DA1F26" },
  figma: { domain: "figma.com", color: "#F24E1E" },
  canva: { domain: "canva.com", color: "#00C4CC" },
  evernote: { domain: "evernote.com", color: "#00A82D" },
  todoist: { domain: "todoist.com", color: "#DB4035" },
  asana: { domain: "asana.com", color: "#F06A6A" },
  trello: { domain: "trello.com", color: "#0052CC" },
  jira: { domain: "atlassian.com", color: "#0052CC" },
  "monday.com": { domain: "monday.com", color: "#FF3D57" },
  monday: { domain: "monday.com", color: "#FF3D57" },
  linear: { domain: "linear.app", color: "#5E6AD2" },
  clickup: { domain: "clickup.com", color: "#7B68EE" },
  airtable: { domain: "airtable.com", color: "#2D7FF9" },
  webflow: { domain: "webflow.com", color: "#4353FF" },
  loom: { domain: "loom.com", color: "#625DF5" },

  // Security & VPN
  "1password": { domain: "1password.com", color: "#1A8CFF" },
  lastpass: { domain: "lastpass.com", color: "#CC0000" },
  dashlane: { domain: "dashlane.com", color: "#005FF5" },
  bitwarden: { domain: "bitwarden.com", color: "#175DDC" },
  nordvpn: { domain: "nordvpn.com", color: "#4687FF" },
  expressvpn: { domain: "expressvpn.com", color: "#DA3940" },
  surfshark: { domain: "surfshark.com", color: "#1B91F0" },
  mullvad: { domain: "mullvad.net", color: "#FFCC00" },

  // Gaming
  "xbox game pass": { domain: "xbox.com", color: "#107C10" },
  xbox: { domain: "xbox.com", color: "#107C10" },
  "playstation plus": { domain: "playstation.com", color: "#003087" },
  "ps plus": { domain: "playstation.com", color: "#003087" },
  psn: { domain: "playstation.com", color: "#003087" },
  "nintendo switch online": { domain: "nintendo.com", color: "#E4000F" },
  nintendo: { domain: "nintendo.com", color: "#E4000F" },
  "ea play": { domain: "ea.com", color: "#FF4747" },
  twitch: { domain: "twitch.tv", color: "#9146FF" },
  steam: { domain: "steampowered.com", color: "#1B2838" },

  // Cloud & Dev
  github: { domain: "github.com", color: "#24292F" },
  vercel: { domain: "vercel.com", color: "#000000" },
  netlify: { domain: "netlify.com", color: "#00C7B7" },
  heroku: { domain: "heroku.com", color: "#430098" },
  digitalocean: { domain: "digitalocean.com", color: "#0080FF" },
  cloudflare: { domain: "cloudflare.com", color: "#F38020" },
  aws: { domain: "aws.amazon.com", color: "#FF9900" },
  setapp: { domain: "setapp.com", color: "#6A5ACD" },

  // Fitness & Health
  peloton: { domain: "onepeloton.com", color: "#E01F27" },
  strava: { domain: "strava.com", color: "#FC4C02" },
  calm: { domain: "calm.com", color: "#4A90D9" },
  headspace: { domain: "headspace.com", color: "#F47D31" },
  noom: { domain: "noom.com", color: "#5DB075" },
  "whoop": { domain: "whoop.com", color: "#000000" },

  // News & Learning
  "new york times": { domain: "nytimes.com", color: "#000000" },
  nyt: { domain: "nytimes.com", color: "#000000" },
  "the economist": { domain: "economist.com", color: "#E3120B" },
  medium: { domain: "medium.com", color: "#000000" },
  substack: { domain: "substack.com", color: "#FF6719" },
  audible: { domain: "audible.com", color: "#F8991D" },
  "kindle unlimited": { domain: "amazon.com", color: "#FF9900" },
  duolingo: { domain: "duolingo.com", color: "#58CC02" },
  masterclass: { domain: "masterclass.com", color: "#1A1A1A" },
  skillshare: { domain: "skillshare.com", color: "#00DE76" },
  coursera: { domain: "coursera.org", color: "#0056D2" },
  "linkedin premium": { domain: "linkedin.com", color: "#0A66C2" },
  linkedin: { domain: "linkedin.com", color: "#0A66C2" },
  blinkist: { domain: "blinkist.com", color: "#00BBCF" },

  // Finance
  revolut: { domain: "revolut.com", color: "#191C1F" },
  monzo: { domain: "monzo.com", color: "#FF3464" },
  "trading 212": { domain: "trading212.com", color: "#00C176" },
  trading212: { domain: "trading212.com", color: "#00C176" },
  wise: { domain: "wise.com", color: "#9FE870" },

  // Apple Services
  icloud: { domain: "apple.com", color: "#3478F6" },
  "apple one": { domain: "apple.com", color: "#555555" },
  "apple arcade": { domain: "apple.com", color: "#555555" },
};

export function getSubscriptionBrand(name) {
  if (!name) return null;
  const key = name.toLowerCase().trim();

  if (BRANDS[key]) return BRANDS[key];

  // Partial match — handle "Netflix Premium", "Spotify Family", etc.
  for (const [brand, data] of Object.entries(BRANDS)) {
    if (key.startsWith(brand) || key.includes(brand)) return data;
  }

  return null;
}

export function getLogoUrl(domain) {
  return `https://logo.clearbit.com/${domain}`;
}
