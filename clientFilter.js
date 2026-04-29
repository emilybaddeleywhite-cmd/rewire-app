// lib/safety/clientFilter.js
// Layer 1 — instant client-side keyword/pattern filter
// Runs in the browser before any API call. Zero latency, zero cost.
// Catches unambiguous harmful content only — nuanced cases go to Layer 2.

// ─── TERM LISTS ────────────────────────────────────────────────────────────────

const CRISIS_TERMS = [
  "suicide",
  "suicidal",
  "kill myself",
  "end my life",
  "take my life",
  "want to die",
  "don't want to exist",
  "don't want to be here",
  "not want to be alive",
  "end it all",
  "self-harm",
  "self harm",
  "cutting myself",
  "hurt myself",
  "harm myself",
  "slit my wrists",
  "overdose on",
  "hang myself",
];

const SELF_HARM_TERMS = [
  "punish my body",
  "punish myself",
  "starve myself",
  "stop eating completely",
  "eat nothing",
  "make myself sick",
  "purge",
  "burn myself",
  "bruise myself",
  "damage myself",
];

const HARM_TO_OTHERS_TERMS = [
  "make them suffer",
  "make her suffer",
  "make him suffer",
  "wish harm on",
  "hurt them",
  "destroy them",
  "ruin their life",
  "ruin his life",
  "ruin her life",
  "get revenge",
  "revenge on",
  "make my ex suffer",
  "punish them",
  "punish her",
  "punish him",
  "make them pay",
];

const CONTROL_TERMS = [
  "make them fall in love",
  "make him fall in love",
  "make her fall in love",
  "make someone obsessed",
  "make them obsessed",
  "control their mind",
  "control his mind",
  "control her mind",
  "make them do what i want",
  "bend them to my will",
  "bend him to my will",
  "make her obey",
  "make him obey",
];

const OCCULT_TERMS = [
  "black magic",
  "hex them",
  "hex him",
  "hex her",
  "put a curse",
  "cast a curse",
  "cast a spell on",
  "demonic",
  "invoke a demon",
  "ritual to harm",
  "bind them",
  "bind him",
  "bind her",
  "spiritual attack",
  "dark sigil",
  "voodoo",
];

const ILLEGAL_TERMS = [
  "commit fraud",
  "get away with stealing",
  "evade the police",
  "evade law enforcement",
  "avoid getting caught",
  "help me stalk",
  "plan to assault",
  "threaten someone",
  "harass them",
  "harass her",
  "harass him",
  "blackmail",
  "extort",
];

const DANGEROUS_TERMS = [
  "while driving",
  "while operating",
  "stop taking my medication",
  "stop my medication",
  "stop my meds",
  "drink more",
  "take more drugs",
  "use more drugs",
  "hypnotise myself while driving",
];

const HATE_TERMS = [
  "white supremac",
  "racial superiority",
  "ethnic cleansing",
  "hate jews",
  "hate muslims",
  "hate christians",
  "hate gay",
  "kill all",
  "subhuman",
  "great replacement",
  "14 words",
];

// ─── CLASSIFIER ────────────────────────────────────────────────────────────────

/**
 * Runs a fast client-side check against the prompt.
 *
 * @param {string} prompt - The user's raw input
 * @returns {{ safe: boolean, category: string|null, crisis: boolean }}
 */
export function clientSafetyCheck(prompt) {
  if (!prompt || typeof prompt !== "string") {
    return { safe: true, category: null, crisis: false };
  }

  const normalised = prompt.toLowerCase().trim();

  // Crisis — highest priority, checked first
  if (matchesAny(normalised, CRISIS_TERMS)) {
    return { safe: false, category: "crisis", crisis: true };
  }

  if (matchesAny(normalised, SELF_HARM_TERMS)) {
    return { safe: false, category: "self_harm", crisis: false };
  }

  if (matchesAny(normalised, HARM_TO_OTHERS_TERMS)) {
    return { safe: false, category: "harm_to_others", crisis: false };
  }

  if (matchesAny(normalised, CONTROL_TERMS)) {
    return { safe: false, category: "control", crisis: false };
  }

  if (matchesAny(normalised, OCCULT_TERMS)) {
    return { safe: false, category: "occult", crisis: false };
  }

  if (matchesAny(normalised, ILLEGAL_TERMS)) {
    return { safe: false, category: "illegal", crisis: false };
  }

  if (matchesAny(normalised, DANGEROUS_TERMS)) {
    return { safe: false, category: "dangerous", crisis: false };
  }

  if (matchesAny(normalised, HATE_TERMS)) {
    return { safe: false, category: "hate", crisis: false };
  }

  return { safe: true, category: null, crisis: false };
}

function matchesAny(text, terms) {
  return terms.some((term) => text.includes(term.toLowerCase()));
}
