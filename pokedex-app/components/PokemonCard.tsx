"use client";

import type { CSSProperties } from "react";
import {
  formatLabel,
  formatPokemonId,
  getTypeTheme,
  hexToRgba,
} from "@/lib/pokemonTheme";

interface PokemonCardProps {
  id: number;
  name: string;
  types: string[];
  image?: string | null;
  selected?: boolean;
  onClick?: () => void;
}

export default function PokemonCard({
  id,
  name,
  types,
  image,
  selected = false,
  onClick,
}: PokemonCardProps) {
  const primaryType = types[0] ?? "unknown";
  const theme = getTypeTheme(primaryType);

  const cardStyle: CSSProperties = {
    background: `linear-gradient(145deg, ${theme.start}, ${theme.end})`,
    boxShadow: selected
      ? `0 24px 48px -24px ${hexToRgba(theme.end, 0.75)}`
      : `0 14px 28px -18px ${hexToRgba(theme.end, 0.45)}`,
    borderColor: hexToRgba("#FFFFFF", 0.28),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={cardStyle}
      className={`group relative isolate w-full cursor-pointer overflow-hidden rounded-3xl border p-5 text-left text-white transition duration-200 hover:-translate-y-1 hover:shadow-2xl active:translate-y-0 ${
        selected ? "scale-[1.01]" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full border border-white/20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-4 -bottom-6 h-24 w-24 rounded-full border border-white/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/22 via-white/0 to-black/12"
      />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide text-white/90">
            {formatPokemonId(id)}
          </p>
          <h2 className="mt-1 text-2xl font-black capitalize leading-none">
            {name}
          </h2>
        </div>

        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-20 w-20 drop-shadow-[0_10px_16px_rgba(0,0,0,0.25)] transition duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="h-20 w-20 rounded-2xl bg-white/15" />
        )}
      </div>

      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        {types.length > 0 ? (
          types.map((type) => (
            <span
              key={`${id}-${type}`}
              className="rounded-full border border-white/30 bg-white/12 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm"
            >
              {formatLabel(type)}
            </span>
          ))
        ) : (
          <span className="rounded-full border border-white/30 bg-white/12 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm">
            Unknown
          </span>
        )}
      </div>
    </button>
  );
}
