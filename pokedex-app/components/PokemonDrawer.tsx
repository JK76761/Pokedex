"use client";

import { useEffect, useState } from "react";

interface Props {
  name: string | null;
  onClose: () => void;
}

export default function PokemonDrawer({ name, onClose }: Props) {
  const [pokemon, setPokemon] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setPokemon(null);
      return;
    }

    async function fetchPokemon() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${name}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch Pokémon");
        }

        const data = await res.json();
        setPokemon(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemon();
  }, [name]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl p-6 transform transition-transform duration-300 ${
        name ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {loading && <p>Loading...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {pokemon && (
        <>
          <button
            className="mb-4 text-sm text-gray-500"
            onClick={onClose}
          >
            ← back
          </button>

          <h2 className="text-2xl font-bold capitalize">
            {pokemon.name}
          </h2>

          <img
            src={
              pokemon.sprites?.other?.["official-artwork"]
                ?.front_default
            }
            alt={pokemon.name}
            className="w-48 mx-auto"
          />

          <p className="mt-4">
            Type: {pokemon.types?.[0]?.type?.name}
          </p>
        </>
      )}
    </div>
  );
}