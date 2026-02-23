export const TYPE_THEMES = {
  normal: { start: "#B0AF94", end: "#C9C8AD" },
  fire: { start: "#FFC09F", end: "#F06E35" },
  water: { start: "#8CA6FF", end: "#5374EB" },
  electric: { start: "#FFECB3", end: "#F2C02C" },
  grass: { start: "#9FD88F", end: "#6DB948" },
  ice: { start: "#B8F3F0", end: "#7FCACA" },
  fighting: { start: "#DF9B93", end: "#AD2C24" },
  poison: { start: "#D19ED2", end: "#933C93" },
  ground: { start: "#F1D9A7", end: "#D7A548" },
  flying: { start: "#E0CCFF", end: "#9461F5" },
  psychic: { start: "#FFB6CC", end: "#F34D7F" },
  bug: { start: "#C4D76D", end: "#85A915" },
  rock: { start: "#D3C97A", end: "#A58E31" },
  ghost: { start: "#BABDD1", end: "#5E5B77" },
  dragon: { start: "#C9A5FF", end: "#4E18B4" },
  dark: { start: "#B3ADA9", end: "#573F3A" },
  steel: { start: "#E1E1E5", end: "#8E8E9B" },
  fairy: { start: "#FAC3DC", end: "#9D567D" },
} as const;

export type PokemonTypeName = keyof typeof TYPE_THEMES;

const FALLBACK_THEME = {
  start: "#CBD5E1",
  end: "#64748B",
};

export function getTypeTheme(type?: string | null) {
  if (!type) {
    return FALLBACK_THEME;
  }

  return TYPE_THEMES[type as PokemonTypeName] ?? FALLBACK_THEME;
}

export function formatPokemonId(id?: number | null) {
  if (!id) {
    return "#---";
  }

  return `#${id.toString().padStart(3, "0")}`;
}

export function formatLabel(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const safeAlpha = Math.max(0, Math.min(1, alpha));

  if (normalized.length !== 6) {
    return `rgba(100, 116, 139, ${safeAlpha})`;
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
}

export function getReadableTextColor(hex: string) {
  const normalized = hex.replace("#", "");

  if (normalized.length !== 6) {
    return "#FFFFFF";
  }

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.68 ? "#0F172A" : "#FFFFFF";
}

export const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

export const STAT_LABELS: Record<(typeof STAT_ORDER)[number], string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export function statPercent(value: number) {
  return Math.max(6, Math.min(100, Math.round((value / 180) * 100)));
}
