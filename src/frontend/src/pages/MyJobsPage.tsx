import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InboxIcon, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Variant_cancelled_printing_pending_completed } from "../backend.d";
import { JobStatusBadge, PriorityBadge } from "../components/StatusBadge";
import { useCancelPrintJob, useGetJobsByUser } from "../hooks/useQueries";

function formatTime(ns: bigint) {
  try {
    const ms = Number(ns / 1_000_000n);
    return new Date(ms).toLocaleString();
  } catch {
    return "—";
  }
}

export default function MyJobsPage() {
  const { data: jobs, isLoading } = useGetJobsByUser();
  const cancelMutation = useCancelPrintJob();

  const sortedJobs = [...(jobs ?? [])].sort((a, b) =>
    Number(b.priority - a.priority),
  );

  const handleCancel = async (jobId: bigint) => {
    try {
      await cancelMutation.mutateAsync(jobId);
      toast.success(`Job #${jobId.toString()} cancelled.`);
    } catch {
      toast.error("Failed to cancel job.");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">My Jobs</h1>
        <p className="text-sm text-muted-foreground">
          Your print job history, sorted by priority
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="myjobs.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : sortedJobs.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="myjobs.empty_state"
        >
          <InboxIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No jobs yet
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Submit a print job to see it here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedJobs.map((job, i) => (
            <div
              key={job.jobId.toString()}
              className="bg-card rounded-xl border border-border p-4 space-y-2 shadow-card animate-fade-in"
              data-ocid={`myjobs.item.${i + 1}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {job.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Job #{job.jobId.toString()} · {job.printer}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <PriorityBadge priority={job.priority} />
                  <JobStatusBadge status={job.status} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatTime(job.submitted)}
                </span>
                {job.status ===
                  Variant_cancelled_printing_pending_completed.pending && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(job.jobId)}
                    disabled={cancelMutation.isPending}
                    className="text-xs text-red-600 border-red-200 hover:bg-red-50 h-7 px-2"
                    data-ocid={`myjobs.delete_button.${i + 1}`}
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
