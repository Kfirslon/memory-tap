import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MemoryCard } from "@/components/MemoryCard";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { Badge } from "@/components/ui/badge";
import { memoryApi } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All" },
  { id: "task", label: "Tasks" },
  { id: "reminder", label: "Reminders" },
  { id: "idea", label: "Ideas" },
  { id: "note", label: "Notes" },
];

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (searchQuery: string, searchCategory: string) => {
    if (!searchQuery.trim() && searchCategory === "all") {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const categoryFilter = searchCategory !== "all" ? searchCategory : undefined;
      const data = await memoryApi.searchMemories(searchQuery, categoryFilter);
      setResults(data);
    } catch (err) {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const onQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    handleSearch(newQuery, category);
  };

  const onCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    handleSearch(query, newCategory);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-muted-foreground">
          Find memories using natural language or filters
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Try 'tasks from last week' or 'meeting notes'"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              className={cn(
                "cursor-pointer px-4 py-1.5 whitespace-nowrap",
                category !== cat.id && "hover:bg-secondary"
              )}
              onClick={() => onCategoryChange(cat.id)}
            >
              {cat.label}
            </Badge>
          ))}
        </div>
      </div>

      {isSearching && <LoadingState />}

      {!isSearching && hasSearched && results.length === 0 && (
        <EmptyState
          icon={SearchIcon}
          title="No results found"
          description="Try different keywords or filters"
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
            description="Enter a query or select a category to find your memories"
          />
        </div>
      )}
    </div>
  );
};

export default Search;
