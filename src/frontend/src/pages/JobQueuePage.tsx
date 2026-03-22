import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { InboxIcon, Layers } from "lucide-react";
import { useState } from "react";
import { JobStatusBadge, PriorityBadge } from "../components/StatusBadge";
import { useGetJobQueue } from "../hooks/useQueries";

const PRIORITY_BORDER: Record<number, string> = {
  20: "border-l-red-500",
  10: "border-l-orange-400",
  5: "border-l-blue-400",
  1: "border-l-gray-300",
};

function getPriorityBorder(priority: bigint) {
  const p = Number(priority);
  if (p >= 20) return PRIORITY_BORDER[20];
  if (p >= 10) return PRIORITY_BORDER[10];
  if (p >= 5) return PRIORITY_BORDER[5];
  return PRIORITY_BORDER[1];
}

function formatTime(ns: bigint) {
  try {
    const ms = Number(ns / 1_000_000n);
    return new Date(ms).toLocaleString();
  } catch {
    return "—";
  }
}

export default function JobQueuePage() {
  const { data: queue, isLoading } = useGetJobQueue();
  const [printerFilter, setPrinterFilter] = useState("all");

  const sorted = [...(queue ?? [])].sort((a, b) =>
    Number(b.priority - a.priority),
  );
  const printers = [...new Set(sorted.map((j) => j.printer))];
  const filtered =
    printerFilter === "all"
      ? sorted
      : sorted.filter((j) => j.printer === printerFilter);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Job Queue</h1>
          <p className="text-sm text-muted-foreground">
            All jobs sorted by priority
          </p>
        </div>
        <div className="flex items-center gap-1 bg-teal-50 text-teal-600 rounded-full px-2.5 py-1 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          {sorted.length}
        </div>
      </div>

      {printers.length > 0 && (
        <Select value={printerFilter} onValueChange={setPrinterFilter}>
          <SelectTrigger className="w-full" data-ocid="queue.select">
            <SelectValue placeholder="Filter by printer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Printers</SelectItem>
            {printers.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {isLoading ? (
        <div className="space-y-3" data-ocid="queue.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          data-ocid="queue.empty_state"
        >
          <InboxIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Queue is empty
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            No jobs waiting to be printed
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((job, i) => (
            <div
              key={job.jobId.toString()}
              className={cn(
                "bg-card rounded-xl border border-l-4 border-border p-3 shadow-card animate-fade-in",
                getPriorityBorder(job.priority),
              )}
              data-ocid={`queue.item.${i + 1}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      #{i + 1}
                    </span>
                    <p className="font-semibold text-sm text-foreground truncate">
                      {job.fileName}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job.printer} · {formatTime(job.submitted)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <PriorityBadge priority={job.priority} />
                  <JobStatusBadge status={job.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
