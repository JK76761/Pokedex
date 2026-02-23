"use client";

import { useEffect, useState } from "react";
import PokemonCard from "../../components/PokemonCard";
import PokemonDrawer from "../../components/PokemonDrawer";

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null);
  const [pokemonList, setPokemonList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchList() {
      try {
        setLoading(true);

        const res = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=20"
        );

        const data = await res.json();
        setPokemonList(data.results);
      } catch (error) {
        console.error("Failed to fetch list:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchList();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-white p-10 flex flex-col">
      <h1 className="text-4xl font-bold mb-8">Pokedex</h1>

      {/* Horizontal Slider */}
      <div className="flex gap-8 overflow-x-auto pb-6">
        {loading && <p>Loading Pokémon...</p>}

        {!loading &&
          pokemonList.map((pokemon, index) => (
            <PokemonCard
              key={pokemon.name}
              id={index + 1}
              name={pokemon.name}
              type="unknown"
              onClick={() => setSelected(pokemon.name)}
            />
          ))}
      </div>

      <PokemonDrawer
        name={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}