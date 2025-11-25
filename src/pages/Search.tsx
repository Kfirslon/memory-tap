import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MemoryCard } from "@/components/MemoryCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { api } from "@/lib/api";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const data = await api.searchMemories(searchQuery);
      setResults(data);
    } catch (err) {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-muted-foreground">
          Find memories using natural language
        </p>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Try 'tasks from last week' or 'meeting notes'"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          className="pl-10"
        />
      </div>

      {isSearching && <LoadingState />}

      {!isSearching && hasSearched && results.length === 0 && (
        <EmptyState
          icon={SearchIcon}
          title="No results found"
          description="Try different keywords or phrases"
        />
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          {results.map((memory) => (
            <MemoryCard
              key={memory.id}
              {...memory}
              onClick={() => navigate(`/memory/${memory.id}`)}
            />
          ))}
        </div>
      )}

      {!hasSearched && (
        <div className="pt-8">
          <EmptyState
            icon={SearchIcon}
            title="Start searching"
            description="Enter a query to find your memories"
          />
        </div>
      )}
    </div>
  );
};

export default Search;
