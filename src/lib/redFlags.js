// Simple, conservative keyword matching for emergency red-flag symptoms.
// This is intentionally basic (no ML) — it only needs to catch clear
// mentions of these patterns in English or Telugu text and stop the normal
// flow. It should never be relied on as a medical triage tool; it exists to
// route people to urgent care messaging quickly, not to rule anything out.

const RED_FLAG_PATTERNS = [
  // Chest pain
  /chest pain/i, /chest tightness/i, /chest pressure/i, /గుండె.*నొప్పి/, /ఛాతీ.*నొప్పి/,
  // Difficulty breathing
  /difficulty breathing/i, /can'?t breathe/i, /cannot breathe/i, /shortness of breath/i,
  /breathless/i, /గాలి.*ఇబ్బంది/, /ఊపిరి.*ఆడ/,
  // Severe bleeding
  /severe bleeding/i, /heavy bleeding/i, /bleeding a lot/i, /uncontrolled bleeding/i,
  /తీవ్రమైన రక్తస్రావం/, /రక్తం.*ఆగడం లేదు/,
  // Stroke signs
  /stroke/i, /face drooping/i, /slurred speech/i, /sudden numbness/i, /sudden weakness/i,
  /sudden confusion/i, /paక్షవాతం/, /పక్షవాతం/, /మాట తడబడ/, /ముఖం.*వంగ/,
  // Other unambiguous emergencies worth including conservatively
  /unconscious/i, /loss of consciousness/i, /severe allergic reaction/i, /anaphylaxis/i,
  /suicidal/i, /coughing blood/i, /vomiting blood/i
];

export function isRedFlag(text) {
  if (!text) return false;
  return RED_FLAG_PATTERNS.some((pattern) => pattern.test(text));
}
