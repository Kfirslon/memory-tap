import { Clock, Bell, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemoryCardProps {
  id: string;
  summary: string;
  category: "task" | "reminder" | "idea" | "note";
  timestamp: string;
  hasReminder?: boolean;
  isFavorite?: boolean;
  onClick?: () => void;
}

const categoryColors = {
  task: "bg-primary/10 text-primary border-primary/20",
  reminder: "bg-warning/10 text-warning border-warning/20",
  idea: "bg-success/10 text-success border-success/20",
  note: "bg-muted text-muted-foreground border-border",
};

const formatDateTime = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export const MemoryCard = ({
  summary,
  category,
  timestamp,
  hasReminder,
  isFavorite,
  onClick,
}: MemoryCardProps) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
        isFavorite && "border-yellow-400 bg-yellow-50/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <p className="text-sm leading-relaxed">{summary}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={cn("text-xs", categoryColors[category])}>
                {category}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDateTime(timestamp)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            {isFavorite && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
            {hasReminder && (
              <Bell className="h-4 w-4 text-warning" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
