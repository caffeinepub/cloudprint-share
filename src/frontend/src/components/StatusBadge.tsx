import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Variant_busy_offline_online,
  Variant_cancelled_printing_pending_completed,
} from "../backend.d";

export function PrinterStatusBadge({
  status,
}: { status: Variant_busy_offline_online }) {
  const config = {
    [Variant_busy_offline_online.online]: {
      label: "Online",
      class: "bg-green-100 text-green-700 border-green-200",
    },
    [Variant_busy_offline_online.busy]: {
      label: "Busy",
      class: "bg-amber-100 text-amber-700 border-amber-200",
    },
    [Variant_busy_offline_online.offline]: {
      label: "Offline",
      class: "bg-red-100 text-red-700 border-red-200",
    },
  };
  const c = config[status] ?? config[Variant_busy_offline_online.offline];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold px-2 py-0.5", c.class)}
    >
      {c.label}
    </Badge>
  );
}

export function JobStatusBadge({
  status,
}: { status: Variant_cancelled_printing_pending_completed }) {
  const config = {
    [Variant_cancelled_printing_pending_completed.pending]: {
      label: "Pending",
      class: "bg-blue-100 text-blue-700 border-blue-200",
    },
    [Variant_cancelled_printing_pending_completed.printing]: {
      label: "Printing",
      class: "bg-amber-100 text-amber-700 border-amber-200",
    },
    [Variant_cancelled_printing_pending_completed.completed]: {
      label: "Completed",
      class: "bg-green-100 text-green-700 border-green-200",
    },
    [Variant_cancelled_printing_pending_completed.cancelled]: {
      label: "Cancelled",
      class: "bg-gray-100 text-gray-500 border-gray-200",
    },
  };
  const c =
    config[status] ??
    config[Variant_cancelled_printing_pending_completed.pending];
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold px-2 py-0.5", c.class)}
    >
      {c.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: bigint }) {
  const p = Number(priority);
  let label = "Low";
  let cls = "bg-gray-100 text-gray-600 border-gray-200";
  if (p >= 20) {
    label = "Urgent";
    cls = "bg-red-100 text-red-700 border-red-200";
  } else if (p >= 10) {
    label = "High";
    cls = "bg-orange-100 text-orange-700 border-orange-200";
  } else if (p >= 5) {
    label = "Normal";
    cls = "bg-blue-100 text-blue-700 border-blue-200";
  }
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold px-2 py-0.5", cls)}
    >
      {label}
    </Badge>
  );
}
