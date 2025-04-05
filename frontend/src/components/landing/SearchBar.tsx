import { SearchIcon } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const query = (form.elements.namedItem("search") as HTMLInputElement).value;
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[1075px]">
      <div className="flex w-full items-center gap-3 bg-white pr-4 pl-8 py-2 rounded-[45.744px] border-[1.525px] border-[#BDCFCC]">
        <input
          type="search"
          name="search"
          placeholder="Search for a question"
          className="flex-1 text-base leading-6 text-[#262725] bg-transparent border-none outline-none placeholder:text-[#262725]"
        />
        <button
          type="submit"
          className="flex items-center justify-center"
          aria-label="Search"
        >
          <SearchIcon className="w-[36.595px] h-[36.595px] flex-shrink-0 text-[#347370]" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
