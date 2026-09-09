interface GenreFilterProps {
  genres: string[];
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
}

export function GenreFilter({
  genres,
  selectedGenre,
  onSelectGenre,
}: GenreFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {genres.map((genre) => {
        const isSelected = selectedGenre === genre;
        return (
          <button
            key={genre}
            onClick={() => onSelectGenre(genre)}
            className={`px-3.5 py-1.5 rounded-applePill text-[13px] font-normal transition-all duration-150 ${
              isSelected
                ? "bg-[#1d1d1f] text-white"
                : "bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f]"
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  );
}
