import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { FileSearch } from "lucide-react";

export const Route = createFileRoute("/dashboard/recruiter/reviews")({
  component: () => (
    <div className="mx-auto max-w-2xl">
      <Card className="p-10 text-center">
        <FileSearch className="mx-auto h-8 w-8 text-primary" />
        <h2 className="mt-3 text-lg font-semibold">Resume Reviews</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Detailed resume review workflow lives under Candidate Analysis. This space is reserved
          for batch review tooling in a future update.
        </p>
      </Card>
    </div>
  ),
});
