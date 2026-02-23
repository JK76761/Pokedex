"use client";

import { useEffect, useState } from "react";
import PokemonCard from "../../components/PokemonCard";
import PokemonDrawer from "../../components/PokemonDrawer";
import { formatLabel } from "@/lib/pokemonTheme";

interface PokemonListApiResponse {
  results: Array<{
    name: string;
    url: string;
  }>;
}

interface PokemonListDetailResponse {
  id: number;
  name: string;
  types: Array<{
    slot: number;
    type: {
      name: string;
    };
  }>;
  sprites: {
    front_default: string | null;
    other?: {
      home?: {
        front_default: string | null;
      };
      ["official-artwork"]?: {
        front_default: string | null;
      };
    };
  };
}

interface PokemonListItem {
  id: number;
  name: string;
  types: string[];
  image: string | null;
}

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null);
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;

    async function fetchList() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=24");

        if (!res.ok) {
          throw new Error("Failed to fetch Pokemon list");
        }

        const data = (await res.json()) as PokemonListApiResponse;

        const detailedPokemon = await Promise.all(
          data.results.map(async (pokemon) => {
            const detailRes = await fetch(pokemon.url);

            if (!detailRes.ok) {
              throw new Error(`Failed to fetch ${pokemon.name}`);
            }

            const detail = (await detailRes.json()) as PokemonListDetailResponse;

            return {
              id: detail.id,
              name: detail.name,
              types: [...detail.types]
                .sort((a, b) => a.slot - b.slot)
                .map((entry) => entry.type.name),
              image:
                detail.sprites.other?.home?.front_default ??
                detail.sprites.other?.["official-artwork"]?.front_default ??
                detail.sprites.front_default,
            } satisfies PokemonListItem;
          })
        );

        if (cancelled) {
          return;
        }

        const sorted = detailedPokemon.sort((a, b) => a.id - b.id);
        setPokemonList(sorted);
        setSelected((current) => current ?? sorted[0]?.name ?? null);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to fetch list:", err);
        setError(err instanceof Error ? err.message : "Failed to load Pokemon");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchList();

    return () => {
      cancelled = true;
    };
  }, []);

  const availableTypes = Array.from(
    new Set(pokemonList.flatMap((pokemon) => pokemon.types))
  ).sort();

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesSearch = pokemon.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());
    const matchesType =
      activeType === "all" || pokemon.types.includes(activeType);

    return matchesSearch && matchesType;
  });

  const selectedExists = filteredPokemon.some(
    (pokemon) => pokemon.name === selected
  );

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#EEF2F8] text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10rem] top-[-8rem] h-[28rem] w-[28rem] rounded-full border border-white/70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 top-10 h-56 w-56 rounded-full border border-white/60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.85),transparent_42%),radial-gradient(circle_at_10%_0%,rgba(120,149,255,0.1),transparent_35%)]"
      />

      <div className="relative z-10 px-5 py-8 sm:px-8 lg:px-12 xl:pr-[32rem]">
        <header className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Kanto Starter Dex
                </p>
                <h1 className="mt-1 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
                  Pokedex
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                  Clean list layout, type-driven colors, and a focused detail panel.
                  The first Pokemon type controls the accent styling.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:w-auto">
                <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Loaded
                  </p>
                  <p className="mt-1 text-2xl font-black">{pokemonList.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Showing
                  </p>
                  <p className="mt-1 text-2xl font-black">{filteredPokemon.length}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400" aria-hidden>
                  Search
                </span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search Pokemon name..."
                  className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveType("all")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeType === "all"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  All types
                </button>
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeType === type
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {formatLabel(type)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="mt-8">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          {loading && pokemonList.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-44 animate-pulse rounded-3xl border border-white/70 bg-white/70 shadow-sm"
                />
              ))}
            </div>
          ) : null}

          {!loading && filteredPokemon.length === 0 ? (
            <div className="rounded-3xl border border-white/70 bg-white/70 p-8 text-center shadow-sm backdrop-blur-xl">
              <p className="text-lg font-bold text-slate-900">No Pokemon found</p>
              <p className="mt-2 text-sm text-slate-500">
                Try clearing the search or choosing a different type filter.
              </p>
            </div>
          ) : null}

          {filteredPokemon.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {filteredPokemon.map((pokemon) => (
                <PokemonCard
                  key={pokemon.id}
                  id={pokemon.id}
                  name={pokemon.name}
                  types={pokemon.types}
                  image={pokemon.image}
                  selected={pokemon.name === selected}
                  onClick={() => setSelected(pokemon.name)}
                />
              ))}
            </div>
          ) : null}
        </section>

        {!selectedExists && selected ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            The selected Pokemon is hidden by the current filter. Clear filters to view
            it again.
          </div>
        ) : null}
      </div>

      <PokemonDrawer name={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
