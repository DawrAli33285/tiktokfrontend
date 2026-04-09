import { Search } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-800 bg-[#0b0b0b] relative">
      

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1a1a1a]/40 to-transparent pointer-events-none" />

     
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          placeholder="Search Trends"
          className="w-full bg-[#111] text-sm text-white pl-10 pr-4 py-2.5 rounded-xl outline-none placeholder-gray-500 focus:ring-1 focus:ring-lime-400/40"
        />
      </div>


     
    </header>
  );
}