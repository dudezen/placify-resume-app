import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";

export const Route = createFileRoute("/dashboard/user/applications")({
  component: () => (
    <div className="mx-auto max-w-2xl">
      <Card className="p-10 text-center">
        <Send className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-lg font-semibold">No applications yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Applications you send will appear here. Hook up your backend to start tracking.
        </p>
      </Card>
    </div>
  ),
});
