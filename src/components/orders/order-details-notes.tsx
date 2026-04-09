import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export function OrderDetailsNotes({ instructions }: { instructions: string | undefined }) {

  return (
    <Card size="sm" className="ring-foreground/10">
      <CardHeader className="border-border/60 border-b pb-3">
        <CardTitle className="text-sm font-medium">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {instructions ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{instructions}</p>
        ) : (
          <p className="text-muted-foreground text-sm">No special instructions.</p>
        )}
      </CardContent>
    </Card>
  );
}
