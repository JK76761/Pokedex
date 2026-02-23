
"use client";

interface props {
    id : number ;
    name : string ;
    type : string ;
    onClick? : ()=> void;
}

export default function PokemonCard({ id, name, type, onClick }: props) {
  return (
    <div
      onClick={onClick}
      className="p-6 rounded-xl bg-green-400 text-white w-60 cursor-pointer transition transform hover:scale-94 hover:shadow-xl active:scale-95"
    >
      <p>#{id.toString().padStart(3, "0")}</p>
      <h2 className="text-xl font-bold capitalize">{name}</h2>
      <p>{type}</p>
    </div>
  );
}


 
