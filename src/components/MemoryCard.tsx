import { Clock, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemoryCardProps {
  id: string;
  summary: string;
  category: "task" | "reminder" | "idea" | "note";
  timestamp: string;
  hasReminder?: boolean;
  onClick?: () => void;
}

const categoryColors = {
  task: "bg-primary/10 text-primary border-primary/20",
  reminder: "bg-warning/10 text-warning border-warning/20",
  idea: "bg-success/10 text-success border-success/20",
  note: "bg-muted text-muted-foreground border-border",
};

const formatDate = (isoString: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export const MemoryCard = ({
  summary,
  category,
  timestamp,
  hasReminder,
  onClick,
}: MemoryCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
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
                <span>{formatDate(timestamp)}</span>
              </div>
            </div>
          </div>
          {hasReminder && (
            <Bell className="h-4 w-4 text-warning flex-shrink-0 mt-1" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
