"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  formatLabel,
  formatPokemonId,
  getReadableTextColor,
  getTypeTheme,
  hexToRgba,
  STAT_LABELS,
  STAT_ORDER,
  statPercent,
} from "@/lib/pokemonTheme";

interface Props {
  name: string | null;
  onClose: () => void;
}

interface PokemonApiResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Array<{
    slot: number;
    type: { name: string };
  }>;
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
  abilities: Array<{
    ability: { name: string };
  }>;
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    back_default: string | null;
    back_shiny: string | null;
    other?: {
      ["official-artwork"]?: {
        front_default: string | null;
      };
      home?: {
        front_default: string | null;
      };
    };
  };
}

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: Record<string, number>;
  artwork: string | null;
  sprites: string[];
}

function toPokemonDetail(data: PokemonApiResponse): PokemonDetail {
  const types = [...data.types]
    .sort((a, b) => a.slot - b.slot)
    .map((entry) => entry.type.name);

  const artwork =
    data.sprites.other?.home?.front_default ??
    data.sprites.other?.["official-artwork"]?.front_default ??
    data.sprites.front_default;

  const spriteCandidates = [
    data.sprites.front_default,
    data.sprites.front_shiny,
    data.sprites.back_default,
    data.sprites.back_shiny,
  ].filter(Boolean) as string[];

  const sprites = [...new Set(spriteCandidates)].slice(0, 4);

  const stats = data.stats.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.stat.name] = entry.base_stat;
    return acc;
  }, {});

  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types,
    abilities: data.abilities.map((ability) => ability.ability.name),
    stats,
    artwork,
    sprites,
  };
}

export default function PokemonDrawer({ name, onClose }: Props) {
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setPokemon(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPokemon() {
      try {
        setPokemon(null);
        setLoading(true);
        setError(null);

        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

        if (!res.ok) {
          throw new Error("Failed to fetch Pokemon");
        }

        const data = (await res.json()) as PokemonApiResponse;

        if (!cancelled) {
          setPokemon(toPokemonDetail(data));
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPokemon();

    return () => {
      cancelled = true;
    };
  }, [name]);

  const primaryType = pokemon?.types[0] ?? "unknown";
  const theme = getTypeTheme(primaryType);
  const heroText = getReadableTextColor(theme.end);
  const accent = theme.end;

  const heroStyle: CSSProperties = {
    background: `linear-gradient(160deg, ${theme.start}, ${theme.end})`,
    color: heroText,
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close details"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[2px] transition xl:hidden ${
          name
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-white/60 bg-white/90 shadow-[0_20px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl transition-transform duration-300 sm:w-[28rem] xl:w-[30rem] ${
          name ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!name}
      >
        {!name ? null : (
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="relative overflow-hidden px-6 pb-8 pt-5" style={heroStyle}>
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-2 h-40 w-40 rounded-full border"
                style={{ borderColor: hexToRgba(heroText, 0.16) }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute right-6 top-10 h-28 w-28 rounded-full border"
                style={{ borderColor: hexToRgba(heroText, 0.16) }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -left-20 -bottom-24 h-64 w-64 rounded-full"
                style={{
                  background: hexToRgba(
                    "#FFFFFF",
                    heroText === "#FFFFFF" ? 0.08 : 0.18
                  ),
                }}
              />

              <button
                type="button"
                className="relative z-10 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold backdrop-blur"
                style={{
                  color: heroText,
                  borderColor: hexToRgba(heroText, 0.22),
                  background: hexToRgba(heroText, 0.08),
                }}
                onClick={onClose}
              >
                <span aria-hidden>{"<-"}</span>
                back
              </button>

              <div className="relative z-10 mt-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold tracking-wide opacity-85">
                    {pokemon ? formatPokemonId(pokemon.id) : formatPokemonId()}
                  </p>
                  <h2 className="mt-1 text-5xl font-black capitalize leading-none">
                    {pokemon?.name ?? name}
                  </h2>
                </div>
              </div>

              <div className="relative z-10 mt-5 flex min-h-[16rem] items-end justify-center">
                {loading && !pokemon ? (
                  <div
                    className="h-56 w-56 animate-pulse rounded-full"
                    style={{ background: hexToRgba(heroText, 0.12) }}
                  />
                ) : (
                  pokemon?.artwork && (
                    <img
                      src={pokemon.artwork}
                      alt={pokemon.name}
                      className="h-60 w-60 object-contain drop-shadow-[0_24px_28px_rgba(0,0,0,0.22)]"
                    />
                  )
                )}
              </div>

              {pokemon ? (
                <div className="relative z-10 mt-5 flex flex-wrap justify-center gap-2">
                  {pokemon.types.map((type) => (
                    <span
                      key={`${pokemon.id}-${type}`}
                      className="rounded-full border px-4 py-1.5 text-sm font-semibold backdrop-blur"
                      style={{
                        color: heroText,
                        borderColor: hexToRgba(heroText, 0.22),
                        background: hexToRgba(heroText, 0.08),
                      }}
                    >
                      {formatLabel(type)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="flex-1 space-y-5 px-6 pb-8 pt-6">
              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {!pokemon && loading ? (
                <div className="space-y-4">
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
                  <div className="h-44 animate-pulse rounded-2xl bg-slate-200/70" />
                  <div className="h-32 animate-pulse rounded-2xl bg-slate-200/70" />
                </div>
              ) : null}

              {pokemon ? (
                <>
                  <section className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Height
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-900">
                        {(pokemon.height / 10).toFixed(1)} m
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Weight
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-900">
                        {(pokemon.weight / 10).toFixed(1)} kg
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Total
                      </p>
                      <p className="mt-2 text-lg font-black text-slate-900">
                        {STAT_ORDER.reduce(
                          (sum, key) => sum + (pokemon.stats[key] ?? 0),
                          0
                        )}
                      </p>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-xl font-black" style={{ color: accent }}>
                        Base Stats
                      </h3>
                      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        First type accent
                      </span>
                    </div>

                    <div className="space-y-3">
                      {STAT_ORDER.map((key) => {
                        const value = pokemon.stats[key] ?? 0;

                        return (
                          <div
                            key={`${pokemon.id}-${key}`}
                            className="grid grid-cols-[74px_44px_1fr] items-center gap-3"
                          >
                            <span className="text-sm font-bold" style={{ color: accent }}>
                              {STAT_LABELS[key]}
                            </span>
                            <span
                              className="text-right text-sm font-bold"
                              style={{ color: accent }}
                            >
                              {value}
                            </span>
                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full transition-[width]"
                                style={{
                                  width: `${statPercent(value)}%`,
                                  background: `linear-gradient(90deg, ${hexToRgba(
                                    accent,
                                    0.42
                                  )}, ${accent})`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <h3 className="text-xl font-black" style={{ color: accent }}>
                      Abilities
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {pokemon.abilities.map((ability) => (
                        <span
                          key={`${pokemon.id}-${ability}`}
                          className="rounded-full border px-3 py-1.5 text-sm font-semibold"
                          style={{
                            color: accent,
                            borderColor: hexToRgba(accent, 0.2),
                            background: hexToRgba(accent, 0.08),
                          }}
                        >
                          {formatLabel(ability)}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <h3 className="text-xl font-black" style={{ color: accent }}>
                      Sprites
                    </h3>
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {pokemon.sprites.length > 0 ? (
                        pokemon.sprites.map((sprite, index) => (
                          <div
                            key={`${pokemon.id}-sprite-${index}`}
                            className="flex aspect-square items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50"
                          >
                            <img
                              src={sprite}
                              alt={`${pokemon.name} sprite ${index + 1}`}
                              className="h-16 w-16 object-contain"
                            />
                          </div>
                        ))
                      ) : (
                        <p className="col-span-4 text-sm text-slate-500">
                          No sprite variants available.
                        </p>
                      )}
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
