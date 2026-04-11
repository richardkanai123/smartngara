import type { Doc } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MessageSquare, User } from "lucide-react";

export default async function OrderDetailsCancellationCard({
  status,
  cancelledAt,
  cancelledReason,
  cancelledBy,
}: {
  status: Doc<"orders">["status"];
  cancelledAt: number | undefined;
  cancelledReason: string | undefined;
  cancelledBy: string | undefined;
}) {
  if (status !== "cancelled") return null;

  return (
    <Card className="w-full border-foreground/10">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
        <CardTitle className="text-lg">Cancellation</CardTitle>
        <Badge
          variant="outline"
          className="border-rose-500/25 bg-rose-500/10 font-medium text-rose-700 dark:text-rose-400"
        >
          Cancelled
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">
              Cancelled on
            </span>
            <span className="text-sm font-medium tabular-nums leading-snug">
              {cancelledAt != null
                ? format(new Date(cancelledAt), "MMM d, yyyy · HH:mm")
                : "Not recorded"}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Reason</span>
            <span className="text-sm font-medium leading-snug whitespace-pre-wrap">
              {cancelledReason?.trim()
                ? cancelledReason.trim()
                : "No reason recorded"}
            </span>
          </div>
        </div>

        {cancelledBy ? (
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary/60 text-secondary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Cancelled by
              </span>
              <span className="text-sm font-medium leading-snug">
                {cancelledBy}
              </span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
