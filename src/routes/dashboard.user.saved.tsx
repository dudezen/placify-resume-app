import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Bookmark } from "lucide-react";

export const Route = createFileRoute("/dashboard/user/saved")({
  component: () => (
    <div className="mx-auto max-w-2xl">
      <Card className="p-10 text-center">
        <Bookmark className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-lg font-semibold">No saved jobs</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Save jobs you're interested in to revisit them later.
        </p>
      </Card>
    </div>
  ),
});
