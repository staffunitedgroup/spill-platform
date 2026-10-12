// Shared by the booking forms, the API and Admin (safe to use on the client).

export const REQUEST_KINDS = ["LIVESTREAM", "PODCAST", "CONFESSIONAL"] as const;
export type RequestKindKey = (typeof REQUEST_KINDS)[number];

export const REQUEST_STATUSES = ["NEW", "CONTACTED", "CONFIRMED", "CLOSED"] as const;
export type RequestStatusKey = (typeof REQUEST_STATUSES)[number];

export const KIND_META: Record<RequestKindKey, { label: string; page: string }> = {
  LIVESTREAM: { label: "Livestream appearance", page: "/livestream" },
  PODCAST: { label: "Podcast production", page: "/podcast" },
  CONFESSIONAL: { label: "Confessional session", page: "/confessional" },
};

export const STATUS_LABEL: Record<RequestStatusKey, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CONFIRMED: "Confirmed",
  CLOSED: "Closed",
};

/** Confessional packages, as shown on /confessional. */
export const CONFESSIONAL_PACKAGES = [
  { name: "SPILL Confessional", price: "129k–159k VND", note: "Recording + digital delivery" },
  { name: "Confessional Plus", price: "249k–349k VND", note: "More time, multiple takes, captions, editing, social-ready clips" },
  { name: "Two-Person Confessional", price: "299k–449k VND", note: "A shared session for two" },
] as const;

export type RequestField = { label: string; value: string };
